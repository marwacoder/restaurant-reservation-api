import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '../../generated/prisma/enums';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockPrismaService = {
    table: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a reservation successfully', async () => {
    mockPrismaService.table.findUnique.mockResolvedValue({
      id: 'table-1',
      capacity: 4,
      restaurant: {
        openingTime: '10:00',
        closingTime: '22:00',
      },
    });

    mockPrismaService.reservation.findFirst.mockResolvedValue(null);
    mockPrismaService.reservation.create.mockResolvedValue({
      id: 'res-1',
    });

    const result = await service.create({
      tableId: 'table-1',
      customerName: 'John',
      phone: '+2348012345678',
      partySize: 2,
      startTime: '2026-01-01T12:00:00.000Z',
      durationMinutes: 60,
    });

    expect(result).toEqual({ id: 'res-1' });
    expect(mockPrismaService.reservation.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if table does not exist', async () => {
    mockPrismaService.table.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        tableId: 'bad-table',
        customerName: 'John',
        phone: '+2348012345678',
        partySize: 2,
        startTime: '2026-01-01T12:00:00.000Z',
        durationMinutes: 60,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException for overlapping reservation', async () => {
    mockPrismaService.table.findUnique.mockResolvedValue({
      id: 'table-1',
      capacity: 4,
      restaurant: {
        openingTime: '10:00',
        closingTime: '22:00',
      },
    });

    mockPrismaService.reservation.findFirst.mockResolvedValue({
      id: 'existing-res',
    });

    await expect(
      service.create({
        tableId: 'table-1',
        customerName: 'John',
        phone: '+2348012345678',
        partySize: 2,
        startTime: '2026-01-01T12:00:00.000Z',
        durationMinutes: 60,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should modify reservation successfully', async () => {
    mockPrismaService.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      customerName: 'John',
      phone: '123',
      partySize: 2,
      startTime: new Date('2026-01-01T12:00:00Z'),
      endTime: new Date('2026-01-01T13:00:00Z'),
      status: ReservationStatus.CONFIRMED,
      table: {
        id: 'table-1',
        capacity: 4,
        restaurant: {
          openingTime: '10:00',
          closingTime: '22:00',
        },
      },
    });

    mockPrismaService.reservation.findFirst.mockResolvedValue(null);
    mockPrismaService.reservation.update.mockResolvedValue({
      id: 'res-1',
    });

    const result = await service.modifyReservation('res-1', {
      partySize: 3,
    });

    expect(result).toEqual({ id: 'res-1' });
  });

  it('should cancel reservation', async () => {
    mockPrismaService.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      status: ReservationStatus.CONFIRMED,
    });

    mockPrismaService.reservation.update.mockResolvedValue({
      status: ReservationStatus.CANCELLED,
    });

    const result = await service.cancelReservation('res-1');

    expect(result.status).toBe(ReservationStatus.CANCELLED);
  });

  it('should throw if reservation already cancelled', async () => {
    mockPrismaService.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      status: ReservationStatus.CANCELLED,
    });

    await expect(service.cancelReservation('res-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return reservations by date', async () => {
    mockPrismaService.reservation.findMany.mockResolvedValue([{ id: 'res-1' }]);

    const result = await service.getReservationsByDate({
      restaurantId: 'rest-1',
      date: '2026-01-01',
    });

    expect(result).toHaveLength(1);
  });
});
