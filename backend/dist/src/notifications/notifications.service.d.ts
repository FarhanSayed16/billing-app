import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    private firebaseApp;
    constructor(prisma: PrismaService);
    private initFirebase;
    sendPushNotification(token: string, title: string, body: string, data?: any): Promise<void>;
    sendNewRegistrationAlert(adminName: string): Promise<void>;
    sendInvoiceVoidedAlert(storeName: string, invoiceId: string): Promise<void>;
    sendDailySummaries(): Promise<void>;
}
