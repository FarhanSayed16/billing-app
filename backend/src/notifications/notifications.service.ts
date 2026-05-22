import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private prisma: PrismaService) {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      if (!admin.apps.length) {
        // Look for the service account file in the environment or locally.
        // It's ignored in VC. For local dev, we default to null if not found.
        const serviceAccountPath = process.env.FIREBASE_CREDENTIALS || './firebase-service-account.json';
        
        let credential;
        try {
          const serviceAccount = require('../../' + serviceAccountPath);
          credential = admin.credential.cert(serviceAccount);
        } catch (e) {
          this.logger.warn(`Firebase credentials missing at ${serviceAccountPath}. Push notifications simulation mode active.`);
        }

        if (credential) {
          this.firebaseApp = admin.initializeApp({ credential });
          this.logger.log('Firebase Admin Initialized successfully.');
        }
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (err) {
      this.logger.error('Error initializing Firebase Admin:', err);
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!this.firebaseApp) {
      this.logger.debug(`[SIMULATED PUSH] To: ${token} | Title: ${title} | Body: ${body}`);
      return;
    }

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: data || {},
      });
      this.logger.log(`Push notification sent to ${token.substring(0, 8)}...`);
    } catch (e) {
      this.logger.error(`Failed to send push notification to ${token}:`, e);
    }
  }

  // --- TRIGGERS ---

  async sendNewRegistrationAlert(adminName: string) {
    const superAdmins = await this.prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', fcm_token: { not: null } },
      select: { fcm_token: true }
    });

    for (const su of superAdmins) {
      if (su.fcm_token) {
        await this.sendPushNotification(
          su.fcm_token,
          'New Registration Request',
          `Store Admin ${adminName} has requested access. Please review in Approvals.`
        );
      }
    }
  }

  async sendInvoiceVoidedAlert(storeName: string, invoiceId: string) {
    const superAdmins = await this.prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', fcm_token: { not: null } },
      select: { fcm_token: true }
    });

    for (const su of superAdmins) {
      if (su.fcm_token) {
        await this.sendPushNotification(
          su.fcm_token,
          'Invoice Voided Alert',
          `An invoice originating from ${storeName} was voided.`
        );
      }
    }
  }

  // --- CRON JOBS ---

  // At 9:00 PM every day
  @Cron('0 21 * * *', { timeZone: 'Asia/Kolkata' })
  async sendDailySummaries() {
    this.logger.log('Running daily summary job...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Process Store Admin summaries
    const stores = await this.prisma.store.findMany({
      where: { is_active: true },
      include: {
        users: { where: { role: 'STORE_ADMIN', fcm_token: { not: null } } }
      }
    });

    let globalRevenueTotal = 0;

    for (const store of stores) {
      const todayTotalAggr = await this.prisma.invoice.aggregate({
        _count: { id: true },
        _sum: { grand_total: true },
        where: { store_id: store.id, created_at: { gte: today, lte: endOfToday }, status: 'ACTIVE' }
      });

      const count = todayTotalAggr._count.id || 0;
      const revenue = Number(todayTotalAggr._sum.grand_total || 0);
      globalRevenueTotal += revenue;

      if (count > 0 || revenue > 0) {
        for (const admin of store.users) {
          if (admin.fcm_token) {
            await this.sendPushNotification(
              admin.fcm_token,
              'Daily Store Summary',
              `Today: ${count} bills generated | ₹${revenue.toFixed(2)} total revenue.`
            );
          }
        }
      }
    }

    // 2. Process Super Admin Global summary
    const superAdmins = await this.prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', fcm_token: { not: null } }
    });

    if (globalRevenueTotal > 0) {
      for (const su of superAdmins) {
        if (su.fcm_token) {
          await this.sendPushNotification(
            su.fcm_token,
            'Global Network Summary',
            `Today across all stores: ₹${globalRevenueTotal.toFixed(2)} total revenue processed.`
          );
        }
      }
    }
  }
}
