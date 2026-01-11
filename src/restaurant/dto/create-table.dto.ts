import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({
    description: 'Restaurant ID this table belongs to',
    example: 'uuid-of-restaurant',
  })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Table number in the restaurant', example: 1 })
  @IsInt()
  @Min(1)
  tableNumber: number;

  @ApiProperty({
    description: 'Maximum capacity of this table',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;
}
