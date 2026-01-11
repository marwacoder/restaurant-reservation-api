import { Test } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RestaurantService', () => {
  let service: RestaurantService;

  // ✅ Create a fake Prisma mock object
  const prismaMock = {
    restaurant: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RestaurantService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(RestaurantService);
  });

  it('creates a restaurant', async () => {
    prismaMock.restaurant.create.mockResolvedValue({
      id: 'uuid-restaurant',
      name: 'Test Bistro',
      openingTime: '10:00',
      closingTime: '22:00',
    });

    const result = await service.createRestaurant({
      name: 'Test Bistro',
      openingTime: '10:00',
      closingTime: '22:00',
      totalTables: 10,
    });

    expect(result.name).toBe('Test Bistro');
    expect(prismaMock.restaurant.create).toHaveBeenCalled();
  });

  it('finds a restaurant', async () => {
    prismaMock.restaurant.findUnique.mockResolvedValue({
      id: 'uuid-restaurant',
      name: 'Test Bistro',
      openingTime: '10:00',
      closingTime: '22:00',
    });

    const result = await service.getRestaurantDetails('uuid-restaurant');
    expect(result.id).toBe('uuid-restaurant');
  });
});
