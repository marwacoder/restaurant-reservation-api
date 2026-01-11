import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { NotFoundException } from '@nestjs/common';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let service: jest.Mocked<RestaurantService>;

  const mockRestaurantService = {
    getRestaurantDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        {
          provide: RestaurantService,
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get(RestaurantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotFoundException if restaurant does not exist', async () => {
    service.getRestaurantDetails.mockRejectedValue(
      new NotFoundException('Restaurant not found'),
    );

    await expect(controller.getDetails('not-exist')).rejects.toThrow(
      NotFoundException,
    );
  });
});
