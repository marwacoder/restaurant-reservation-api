import {
  IsUUID,
  IsString,
  IsPhoneNumber,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID of the table to reserve',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  tableId: string;

  @ApiProperty({
    description: 'Name of the customer making the reservation',
    example: 'John Doe',
  })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Customer phone number in international format',
    example: '+2348012345678',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'Number of people in the party',
    minimum: 1,
    example: 4,
  })
  @IsInt()
  @Min(1)
  partySize: number;

  @ApiProperty({
    description: 'Start time of the reservation (ISO 8601 format)',
    example: '2026-01-10T19:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Duration of the reservation in minutes (minimum 15)',
    minimum: 15,
    example: 120,
  })
  @IsInt()
  @Min(15)
  durationMinutes: number;
}
