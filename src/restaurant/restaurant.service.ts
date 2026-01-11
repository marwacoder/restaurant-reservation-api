import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from './../../generated/prisma/client';
import Redis from 'ioredis';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async createRestaurant(dto: CreateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
      },
    });

    // Invalidate list cache (if any)
    await this.redis.del('restaurants:all');

    return restaurant;
  }

  async addTable(dto: CreateTableDto) {
    const lockKey = `lock:restaurant:${dto.restaurantId}:table:${dto.tableNumber}`;

    const lock = await this.redis.set(lockKey, 'locked', 'EX', 5, 'NX');
    if (lock !== 'OK') {
      throw new ConflictException('Table creation already in progress');
    }

    try {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: dto.restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      const table = await this.prisma.table.create({
        data: {
          restaurantId: dto.restaurantId,
          tableNumber: dto.tableNumber,
          capacity: dto.capacity,
        },
      });

      await this.redis.del(`restaurant:${dto.restaurantId}`);

      return table;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Table number ${dto.tableNumber} already exists for this restaurant`,
        );
      }

      throw error;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async getRestaurantDetails(restaurantId: string) {
    const cacheKey = `restaurant:${restaurantId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        tables: {
          include: {
            reservations: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const now = new Date();
    const availableTables = restaurant.tables?.filter((table) => {
      return !table.reservations.some(
        (r) => new Date(r.startTime) <= now && new Date(r.endTime) > now,
      );
    });

    const result = {
      ...restaurant,
      availableTables,
    };
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

    return result;
  }
}
