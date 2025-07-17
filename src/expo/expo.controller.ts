import { Controller, Post, Get, Body, Delete, Param } from '@nestjs/common';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { FirebaseService } from './expo.service';

@Controller('expo-notif')
export class PushNotificationController {
  private expo = new Expo();

  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('register-token')
  async registerPushToken(@Body() body: { token: string; userId: string }) {
    const { token, userId } = body;
    await this.firebaseService.saveToken(userId, token);
    return { message: 'Token saved' };
  }

  @Post('send')
  async sendNotification(
    @Body()
    body: {
      userId: string;
      title?: string;
      body?: string;
      channelId?: string;
      data?: any;
    },
  ) {
    const { userId, title, body: messageBody, channelId, data } = body;
    const tickets = await this.firebaseService.sendPushNotification(
      userId,
      title,
      messageBody,
      channelId,
      data,
    );

    return { message: 'Notification sent', tickets };
  }

  @Post('delete-token')
  async deleteToken(@Body() body: { userId: string; token: string }) {
    const { userId, token } = body;
    await this.firebaseService.deleteToken(userId, token);
    return { message: 'Token deleted' };
  }

  @Get('connected-users')
  async getConnectedUsers() {
    const users = await this.firebaseService.getUsers();
    return users;
  }

  @Delete(':userId/tokens')
  async deleteAllTokens(@Param('userId') userId: string) {
    await this.firebaseService.deleteAllTokens(userId);
    return { message: 'All tokens deleted' };
  }
}
