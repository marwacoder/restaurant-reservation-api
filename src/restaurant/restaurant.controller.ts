import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Restaurant created' })
  async create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(dto);
  }

  @Post('tables')
  @ApiResponse({ status: 201, description: 'Table added to restaurant' })
  async addTable(@Body() dto: CreateTableDto) {
    return this.restaurantService.addTable(dto);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Get restaurant with available tables',
  })
  async getDetails(@Param('id') id: string) {
    return this.restaurantService.getRestaurantDetails(id);
  }
}
