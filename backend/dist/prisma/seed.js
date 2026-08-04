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
const generateId = () => Math.random().toString(36).substring(2, 18).padEnd(16, '0');
async function main() {
    console.log('Starting massive seed process...');
    const randomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    const brand = await prisma.brand.create({
        data: {
            name: 'BillPush Enterprise',
            logo_url: 'https://example.com/logo.png',
            primary_color: '#1E88E5',
        },
    });
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    await prisma.user.create({
        data: {
            brand_id: brand.id,
            email: 'admin@billpush.com',
            password_hash: hashedPassword,
            name: 'Super Admin',
            phone: '9999999999',
            role: client_1.Role.SUPER_ADMIN,
            approval_status: client_1.ApprovalStatus.APPROVED,
        },
    });
    const storeData = [
        { name: 'Mumbai Flagship', city: 'Mumbai', state: 'Maharashtra', address: 'Bandra West' },
        { name: 'Delhi Hub', city: 'New Delhi', state: 'Delhi', address: 'Connaught Place' },
        { name: 'Bangalore Tech Park', city: 'Bangalore', state: 'Karnataka', address: 'Indiranagar' },
        { name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', address: 'T. Nagar' },
        { name: 'Pune Express', city: 'Pune', state: 'Maharashtra', address: 'Koregaon Park' },
    ];
    const stores = await Promise.all(storeData.map((s, index) => prisma.store.create({
        data: {
            brand_id: brand.id,
            name: s.name,
            address: s.address,
            city: s.city,
            state: s.state,
            phone: `900000000${index}`,
            is_active: true,
        },
    })));
    const users = [];
    for (const store of stores) {
        const admin = await prisma.user.create({
            data: {
                brand_id: brand.id,
                store_id: store.id,
                name: `${store.city} Admin`,
                email: `admin.${store.city.toLowerCase().replace(' ', '')}@billpush.com`,
                password_hash: hashedPassword,
                phone: `80000${Math.floor(10000 + Math.random() * 90000)}`,
                role: client_1.Role.STORE_ADMIN,
                approval_status: client_1.ApprovalStatus.APPROVED,
            }
        });
        users.push(admin);
        const numEmployees = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numEmployees; i++) {
            const emp = await prisma.user.create({
                data: {
                    brand_id: brand.id,
                    store_id: store.id,
                    name: `Employee ${i + 1} (${store.city})`,
                    phone: `70000${Math.floor(10000 + Math.random() * 90000)}`,
                    pin: await bcrypt.hash('1234', 12),
                    role: client_1.Role.EMPLOYEE,
                    approval_status: client_1.ApprovalStatus.APPROVED,
                }
            });
            users.push(emp);
        }
    }
    const productsData = [
        { name: 'Wireless Headphones', price: 2499, tax: 18, cat: 'Electronics' },
        { name: 'Smart Watch', price: 3999, tax: 18, cat: 'Electronics' },
        { name: 'Premium Coffee Beans', price: 1200, tax: 5, cat: 'Groceries' },
        { name: 'Organic Honey 500g', price: 450, tax: 5, cat: 'Groceries' },
        { name: 'USB-C Cable 2m', price: 349, tax: 18, cat: 'Accessories' },
        { name: 'Power Bank 10000mAh', price: 1499, tax: 18, cat: 'Accessories' },
        { name: 'Running Shoes', price: 2999, tax: 12, cat: 'Apparel' },
        { name: 'Cotton T-Shirt', price: 699, tax: 5, cat: 'Apparel' },
    ];
    const products = await Promise.all(productsData.map((p, idx) => prisma.product.create({
        data: {
            brand_id: brand.id,
            name: p.name,
            base_price: p.price,
            tax_rate: p.tax,
            category: p.cat,
            barcode: `8901030${idx}`,
            sku: `SKU-${p.cat.substring(0, 3).toUpperCase()}-${idx}`,
        },
    })));
    for (const store of stores) {
        await Promise.all(products.map(product => prisma.storeInventory.create({
            data: {
                store_id: store.id,
                product_id: product.id,
                quantity: Math.floor(Math.random() * 200) + 50,
            },
        })));
    }
    const customers = [];
    for (let i = 0; i < 50; i++) {
        const cust = await prisma.customer.create({
            data: {
                brand_id: brand.id,
                name: `Customer ${i + 1}`,
                phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                created_at: randomDate(new Date(2026, 0, 1), new Date()),
            }
        });
        customers.push(cust);
    }
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    for (const store of stores) {
        const storeEmployees = users.filter(u => u.store_id === store.id);
        const numInvoices = Math.floor(Math.random() * 150) + 150;
        for (let i = 0; i < numInvoices; i++) {
            const emp = storeEmployees[Math.floor(Math.random() * storeEmployees.length)];
            const cust = customers[Math.floor(Math.random() * customers.length)];
            const numItems = Math.floor(Math.random() * 4) + 1;
            const selectedProducts = [];
            for (let j = 0; j < numItems; j++) {
                selectedProducts.push(products[Math.floor(Math.random() * products.length)]);
            }
            let subtotal = 0;
            let taxTotal = 0;
            for (const p of selectedProducts) {
                const qty = Math.floor(Math.random() * 3) + 1;
                const itemTotal = Number(p.base_price) * qty;
                const itemTax = itemTotal * (Number(p.tax_rate) / 100);
                subtotal += itemTotal;
                taxTotal += itemTax;
            }
            const grandTotal = subtotal + taxTotal;
            const invoiceDate = randomDate(sixMonthsAgo, now);
            const invoice = await prisma.invoice.create({
                data: {
                    invoice_number: `INV-${store.city.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
                    billing_id: generateId().substring(0, 16),
                    brand_id: brand.id,
                    store_id: store.id,
                    customer_id: cust.id,
                    employee_id: emp.id,
                    subtotal: subtotal,
                    tax_amount: taxTotal,
                    grand_total: grandTotal,
                    status: client_1.InvoiceStatus.ACTIVE,
                    created_at: invoiceDate,
                }
            });
            for (const p of selectedProducts) {
                const qty = Math.floor(Math.random() * 3) + 1;
                const itemTotal = Number(p.base_price) * qty;
                const itemTax = itemTotal * (Number(p.tax_rate) / 100);
                await prisma.invoiceItem.create({
                    data: {
                        invoice_id: invoice.id,
                        product_id: p.id,
                        name: p.name,
                        quantity: qty,
                        unit_price: p.base_price,
                        tax_rate: p.tax_rate,
                        tax_amount: itemTax,
                        total: itemTotal + itemTax,
                    }
                });
            }
        }
    }
    await prisma.user.create({
        data: {
            brand_id: brand.id,
            store_id: stores[0].id,
            name: 'Pending User',
            email: 'pending@billpush.com',
            phone: '8888888888',
            password_hash: hashedPassword,
            role: client_1.Role.STORE_ADMIN,
            approval_status: client_1.ApprovalStatus.PENDING,
            created_at: now,
        }
    });
    console.log('Massive seed completed successfully.');
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