import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsInt,
  Min,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from './../../../generated/prisma/enums';

export class ModifyReservationDto {
  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ description: 'Party size', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  partySize?: number;

  @ApiPropertyOptional({
    description: 'Reservation start time (ISO)',
    example: '2026-01-10T19:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', minimum: 15 })
  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Reservation status' })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
