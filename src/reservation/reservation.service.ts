import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from './../../generated/prisma/enums';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ModifyReservationDto } from './dto/modify-reservation.dto';
import { FindReservationsByDateDto } from './dto/find-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private reservationCacheKey(restaurantId: string, date: string) {
    return `reservations:${restaurantId}:${date}`;
  }

  private lockKey(tableId: string, start: Date, end: Date) {
    return `lock:table:${tableId}:${start.toISOString()}:${end.toISOString()}`;
  }

  async create(dto: CreateReservationDto) {
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
      include: { restaurant: true },
    });

    if (!table) throw new NotFoundException('Table not found');
    if (dto.partySize > table.capacity) {
      throw new BadRequestException(`Table capacity is ${table.capacity}`);
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + dto.durationMinutes * 60000);

    this.validateOperatingHours(startTime, endTime, table.restaurant);

    const lockKey = this.lockKey(table.id, startTime, endTime);
    const lock = await this.redis.set(lockKey, 'locked', 'EX', 5, 'NX');

    if (!lock) {
      throw new ConflictException('Reservation is being processed, try again');
    }

    try {
      const overlapping = await this.prisma.reservation.findFirst({
        where: {
          tableId: table.id,
          status: ReservationStatus.CONFIRMED,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (overlapping) {
        throw new ConflictException('Table already booked for this time slot');
      }

      const reservation = await this.prisma.reservation.create({
        data: {
          customerName: dto.customerName,
          phone: dto.phone,
          partySize: dto.partySize,
          startTime,
          endTime,
          tableId: table.id,
        },
      });

      const date = startTime.toISOString().split('T')[0];
      await this.redis.del(this.reservationCacheKey(table.restaurantId, date));

      return reservation;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async modifyReservation(id: string, dto: ModifyReservationDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: { include: { restaurant: true } } },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const table = reservation.table;

    const partySize = dto.partySize ?? reservation.partySize;
    if (partySize > table.capacity) {
      throw new BadRequestException(`Table capacity is ${table.capacity}`);
    }

    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : reservation.startTime;
    const durationMinutes =
      dto.durationMinutes ??
      (reservation.endTime.getTime() - reservation.startTime.getTime()) / 60000;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    this.validateOperatingHours(startTime, endTime, table.restaurant);

    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        tableId: table.id,
        status: ReservationStatus.CONFIRMED,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        NOT: { id },
      },
    });
    if (overlapping)
      throw new ConflictException('Table already booked for this time slot');

    return this.prisma.reservation.update({
      where: { id },
      data: {
        customerName: dto.customerName ?? reservation.customerName,
        phone: dto.phone ?? reservation.phone,
        partySize,
        startTime,
        endTime,
        status: dto.status ?? reservation.status,
      },
    });
  }
  async getReservationsByDate({
    date,
    restaurantId,
  }: FindReservationsByDateDto) {
    const cacheKey = this.reservationCacheKey(restaurantId, date);

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        startTime: { gte: start, lte: end },
      },
      include: { table: true },
      orderBy: { startTime: 'asc' },
    });

    await this.redis.set(cacheKey, JSON.stringify(reservations), 'EX', 60);

    return reservations;
  }

  async cancelReservation(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation already cancelled');
    }

    const result = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    });

    const date = reservation.startTime.toISOString().split('T')[0];
    await this.redis.del(
      this.reservationCacheKey(reservation.table.restaurantId, date),
    );

    return result;
  }

  private validateOperatingHours(
    start: Date,
    end: Date,
    restaurant: { openingTime: string; closingTime: string },
  ) {
    const startTime = start.toTimeString().slice(0, 5);
    const endTime = end.toTimeString().slice(0, 5);

    if (
      startTime < restaurant.openingTime ||
      endTime > restaurant.closingTime
    ) {
      throw new BadRequestException('Reservation outside operating hours');
    }
  }
}
