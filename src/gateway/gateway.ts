import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class Gateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('authenticate', (userId: string) => {
        if (!userId || typeof userId !== 'string') {
          console.error('Invalid user ID received for authentication');
          return;
        }
        this.userSockets.set(userId, socket.id);
        console.log(`User ${userId} authenticated on socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        const userId = [...this.userSockets.entries()].find(
          ([_, socketId]) => socketId === socket.id,
        )?.[0];

        if (userId) {
          this.userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          this.server.emit('userDisconnected', { userId });
        }

        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitEventToUser(userId: string, eventName: string, payload: any) {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid user ID for event emission');
      return;
    }
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(eventName, payload);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }

  emitEventToAll(eventName: string, payload: any) {
    this.server.emit(eventName, payload);
  }
}
