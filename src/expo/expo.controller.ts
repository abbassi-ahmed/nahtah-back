import { Controller, Post, Get, Body, Delete, Param } from '@nestjs/common';
import { FirebaseService } from './expo.service';

@Controller('expo-notif')
export class PushNotificationController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('register-token')
  async registerPushToken(
    @Body() body: { token: string; userId: string; role: string },
  ) {
    const { token, userId, role } = body;
    await this.firebaseService.saveToken(userId, token, role);
    return { message: 'Token saved with role information' };
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

  @Post('send-to-role')
  async sendNotificationToRole(
    @Body()
    body: {
      role: string;
      title?: string;
      body?: string;
      channelId?: string;
      data?: any;
    },
  ) {
    const { role, title, body: messageBody, channelId, data } = body;
    const tickets = await this.firebaseService.sendNotificationsToRole(
      role,
      title,
      messageBody,
      channelId,
      data,
    );

    return { message: `Notification sent to all ${role}s`, tickets };
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

  @Get('users-by-role/:role')
  async getUsersByRole(@Param('role') role: string) {
    const userIds = await this.firebaseService.getUsersByRole(role);
    return { role, userIds };
  }

  @Delete(':userId/tokens')
  async deleteAllTokens(@Param('userId') userId: string) {
    await this.firebaseService.deleteAllTokens(userId);
    return { message: 'All tokens deleted' };
  }
}
