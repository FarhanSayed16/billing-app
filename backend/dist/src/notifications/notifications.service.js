"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const admin = __importStar(require("firebase-admin"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    firebaseApp = null;
    constructor(prisma) {
        this.prisma = prisma;
        this.initFirebase();
    }
    initFirebase() {
        try {
            if (!admin.apps.length) {
                const serviceAccountPath = process.env.FIREBASE_CREDENTIALS || './firebase-service-account.json';
                let credential;
                try {
                    const serviceAccount = require('../../' + serviceAccountPath);
                    credential = admin.credential.cert(serviceAccount);
                }
                catch (e) {
                    this.logger.warn(`Firebase credentials missing at ${serviceAccountPath}. Push notifications simulation mode active.`);
                }
                if (credential) {
                    this.firebaseApp = admin.initializeApp({ credential });
                    this.logger.log('Firebase Admin Initialized successfully.');
                }
            }
            else {
                this.firebaseApp = admin.app();
            }
        }
        catch (err) {
            this.logger.error('Error initializing Firebase Admin:', err);
        }
    }
    async sendPushNotification(token, title, body, data) {
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
        }
        catch (e) {
            this.logger.error(`Failed to send push notification to ${token}:`, e);
        }
    }
    async sendNewRegistrationAlert(adminName) {
        const superAdmins = await this.prisma.user.findMany({
            where: { role: 'SUPER_ADMIN', fcm_token: { not: null } },
            select: { fcm_token: true }
        });
        for (const su of superAdmins) {
            if (su.fcm_token) {
                await this.sendPushNotification(su.fcm_token, 'New Registration Request', `Store Admin ${adminName} has requested access. Please review in Approvals.`);
            }
        }
    }
    async sendInvoiceVoidedAlert(storeName, invoiceId) {
        const superAdmins = await this.prisma.user.findMany({
            where: { role: 'SUPER_ADMIN', fcm_token: { not: null } },
            select: { fcm_token: true }
        });
        for (const su of superAdmins) {
            if (su.fcm_token) {
                await this.sendPushNotification(su.fcm_token, 'Invoice Voided Alert', `An invoice originating from ${storeName} was voided.`);
            }
        }
    }
    async sendDailySummaries() {
        this.logger.log('Running daily summary job...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
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
                        await this.sendPushNotification(admin.fcm_token, 'Daily Store Summary', `Today: ${count} bills generated | ₹${revenue.toFixed(2)} total revenue.`);
                    }
                }
            }
        }
        const superAdmins = await this.prisma.user.findMany({
            where: { role: 'SUPER_ADMIN', fcm_token: { not: null } }
        });
        if (globalRevenueTotal > 0) {
            for (const su of superAdmins) {
                if (su.fcm_token) {
                    await this.sendPushNotification(su.fcm_token, 'Global Network Summary', `Today across all stores: ₹${globalRevenueTotal.toFixed(2)} total revenue processed.`);
                }
            }
        }
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)('0 21 * * *', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "sendDailySummaries", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map