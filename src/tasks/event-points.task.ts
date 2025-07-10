import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { UsersService } from 'src/users/services/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EventPointsTask {
  constructor(
    private readonly eventService: EventService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async checkAndAddPoints() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const events =
      await this.eventService.getEventsAcceptedAroundTime(thirtyMinutesAgo);

    for (const event of events) {
      if (event.client) {
        await this.usersService.addPoints(
          event.client._id.toString(),
          event.points,
        );
        await this.eventService.updateEventStatus(
          (event._id as string).toString(),
          'COMPLETED',
        );
        await this.eventService.markPointsAdded(
          (event._id as string).toString(),
        );
      }
    }
  }
}
