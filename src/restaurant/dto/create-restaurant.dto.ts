import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Restaurant name', example: 'Tallie Diner' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Opening time in HH:MM', example: '10:00' })
  @IsString()
  openingTime: string;

  @ApiProperty({ description: 'Closing time in HH:MM', example: '22:00' })
  @IsString()
  closingTime: string;

  @ApiProperty({
    description: 'Total number of tables in the restaurant',
    minimum: 1,
    example: 10,
  })
  @IsInt()
  @Min(1)
  totalTables: number;
}
