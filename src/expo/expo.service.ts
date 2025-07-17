import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class FirebaseService {
  private expo = new Expo();

  private db;
  private dbRef;

  constructor() {
    const firebaseConfig = {
      apiKey: 'AIzaSyA_NsB0Sfti-lk1ewHryml7OaZC4icWFI8',
      authDomain: 'nahtah-mobile-66208.firebaseapp.com',
      databaseURL: 'https://nahtah-mobile-66208-default-rtdb.firebaseio.com',
      projectId: 'nahtah-mobile-66208',
      storageBucket: 'nahtah-mobile-66208.firebasestorage.app',
      messagingSenderId: '33086891031',
      appId: '1:33086891031:web:57e62119e24333c3456852',
      measurementId: 'G-W09V5FVBC0',
    };

    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
    this.dbRef = ref(this.db);
  }

  async saveToken(userId: string, token: string): Promise<void> {
    const userDataRef = ref(this.db, `users/${userId}`);
    const snapshot = await get(userDataRef);
    const userData = snapshot.val() || {};

    const tokens = userData.tokens ? userData.tokens : [];
    if (!tokens.includes(token)) {
      await set(userDataRef, { ...userData, tokens: [...tokens, token] });
    }
  }

  async getUsers(): Promise<any> {
    const usersRef = ref(this.db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  }

  async getTokens(userId: string): Promise<string[]> {
    const userDataRef = ref(this.db, `users/${userId}`);
    const snapshot = await get(userDataRef);
    const userData = snapshot.val() || {};
    return userData.tokens || [];
  }

  async deleteToken(userId: string, tokenToDelete: string): Promise<void> {
    const userDataRef = ref(this.db, `users/${userId}`);
    const snapshot = await get(userDataRef);
    const userData = snapshot.val() || {};

    if (userData.tokens && userData.tokens.includes(tokenToDelete)) {
      const updatedTokens = userData.tokens.filter(
        (token) => token !== tokenToDelete,
      );
      await set(userDataRef, { ...userData, tokens: updatedTokens });
    }
  }

  async deleteAllTokens(userId: string): Promise<void> {
    const userDataRef = ref(this.db, `users/${userId}`);
    const snapshot = await get(userDataRef);
    const userData = snapshot.val() || {};

    if (userData.tokens) {
      await set(userDataRef, { ...userData, tokens: [] });
    }
  }

  async sendPushNotification(
    userId: string,
    title: string = 'Event',
    body: string = 'Event',
    channelId: string = 'default',
    data?: any,
  ) {
    const tokens = await this.getTokens(userId);

    if (!tokens || tokens.length === 0) {
      throw new Error('No push tokens found for this user');
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      channelId,
      data,
    }));

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      return tickets;
    } catch (error) {
      throw new Error(`Error sending push notification: ${error.message}`);
    }
  }

  async sendBulkNotifications(
    userIds: string[],
    title: string = 'Event',
    body: string = 'Event',
    channelId: string = 'default',
    data?: any,
  ) {
    const allTokens: ExpoPushTicket[] = [];

    for (const userId of userIds) {
      const tokens: any = await this.getTokens(userId);
      if (tokens && tokens.length > 0) {
        allTokens.push(...tokens);
      }
    }

    if (allTokens.length === 0) {
      throw new Error('No push tokens found for any of the users');
    }

    const messages = allTokens.map((token: any) => ({
      to: token,
      sound: 'default',
      title,
      body,
      channelId,
    }));

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      return tickets;
    } catch (error) {
      throw new Error(
        `Error sending bulk push notifications: ${error.message}`,
      );
    }
  }
}
