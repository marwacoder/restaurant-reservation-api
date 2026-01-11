import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './reservation/reservation.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [ReservationModule, RestaurantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
