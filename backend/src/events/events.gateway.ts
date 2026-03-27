import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`Client connected: ${client.id}, joined user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_request')
  handleJoinRequest(
    @MessageBody() requestId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`request_${requestId}`);
    console.log(`Client ${client.id} joined request_${requestId}`);
  }

  @SubscribeMessage('leave_request')
  handleLeaveRequest(
    @MessageBody() requestId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`request_${requestId}`);
    console.log(`Client ${client.id} left request_${requestId}`);
  }

  // Helper methods to emit from services
  emitMessage(requestId: string, message: any) {
    this.server.to(`request_${requestId}`).emit('new_message', message);
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }
}
