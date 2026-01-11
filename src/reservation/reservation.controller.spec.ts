import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '../../generated/prisma/enums';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: jest.Mocked<ReservationService>;

  const mockReservationService = {
    create: jest.fn(),
    getReservationsByDate: jest.fn(),
    modifyReservation: jest.fn(),
    cancelReservation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------- CREATE -------------------- */

  it('should create a reservation', async () => {
    service.create.mockResolvedValue({ id: 'res-1' } as any);

    const result = await controller.create({
      tableId: 'table-1',
      customerName: 'John',
      phone: '+2348012345678',
      partySize: 2,
      startTime: '2026-01-01T12:00:00.000Z',
      durationMinutes: 60,
    });

    expect(service.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'res-1' });
  });

  /* -------------------- FIND BY DATE -------------------- */

  it('should return reservations by date', async () => {
    service.getReservationsByDate.mockResolvedValue([{ id: 'res-1' }] as any);

    const result = await controller.findByDate({
      restaurantId: 'rest-1',
      date: '2026-01-01',
    });

    expect(service.getReservationsByDate).toHaveBeenCalledWith({
      restaurantId: 'rest-1',
      date: '2026-01-01',
    });
    expect(result).toHaveLength(1);
  });

  /* -------------------- MODIFY -------------------- */

  it('should modify a reservation', async () => {
    service.modifyReservation.mockResolvedValue({ id: 'res-1' } as any);

    const result = await controller.modify('res-1', {
      partySize: 3,
    });

    expect(service.modifyReservation).toHaveBeenCalledWith('res-1', {
      partySize: 3,
    });
    expect(result).toEqual({ id: 'res-1' });
  });

  /* -------------------- CANCEL -------------------- */

  it('should cancel a reservation', async () => {
    service.cancelReservation.mockResolvedValue({
      status: ReservationStatus.CANCELLED,
    } as any);

    const result = await controller.cancel('res-1');

    expect(service.cancelReservation).toHaveBeenCalledWith('res-1');
    expect(result.status).toBe(ReservationStatus.CANCELLED);
  });

  it('should propagate errors from service', async () => {
    service.cancelReservation.mockRejectedValue(
      new BadRequestException('Already cancelled'),
    );

    await expect(controller.cancel('res-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
