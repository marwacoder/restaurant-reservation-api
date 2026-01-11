import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ModifyReservationDto } from './dto/modify-reservation.dto';
import { FindReservationsByDateDto } from './dto/find-reservation.dto';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  @Get()
  findByDate(@Query() query: FindReservationsByDateDto) {
    return this.reservationService.getReservationsByDate(query);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Modify a reservation' })
  async modify(@Param('id') id: string, @Body() dto: ModifyReservationDto) {
    return this.reservationService.modifyReservation(id, dto);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  async cancel(@Param('id') id: string) {
    return this.reservationService.cancelReservation(id);
  }
}
