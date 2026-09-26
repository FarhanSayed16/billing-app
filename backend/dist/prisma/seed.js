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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting minimal seed process...');
    const brand = await prisma.brand.create({
        data: {
            name: 'BayGuyz',
            logo_url: 'https://example.com/logo.png',
            primary_color: '#4B1426',
        },
    });
    const store = await prisma.store.create({
        data: {
            brand_id: brand.id,
            name: 'bayguyz',
            address: 'Main Street',
            city: 'City',
            state: 'State',
            phone: '9000000000',
            is_active: true,
        },
    });
    const hashedPassword = await bcrypt.hash('Alkaifizhar@1995', 12);
    await prisma.user.create({
        data: {
            brand_id: brand.id,
            store_id: store.id,
            email: 'bayguyzadmin@gmail.com',
            password_hash: hashedPassword,
            name: 'Bayguyz Admin',
            phone: '9999999999',
            role: client_1.Role.SUPER_ADMIN,
            approval_status: client_1.ApprovalStatus.APPROVED,
        },
    });
    const managerPassword = await bcrypt.hash('manager123', 12);
    await prisma.user.create({
        data: {
            brand_id: brand.id,
            store_id: store.id,
            email: 'manager@bayguyz.com',
            password_hash: managerPassword,
            name: 'Bayguyz Manager',
            phone: '8888888888',
            role: client_1.Role.STORE_ADMIN,
            approval_status: client_1.ApprovalStatus.APPROVED,
        },
    });
    console.log('Minimal seed completed successfully. All other dummy data excluded.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map