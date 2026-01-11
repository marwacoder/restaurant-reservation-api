import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindReservationsByDateDto {
  @ApiProperty({
    description: 'ID of the restaurant',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({
    description: 'Date to get reservations for (YYYY-MM-DD format)',
    example: '2026-01-15',
  })
  @IsDateString()
  date: string;
}
