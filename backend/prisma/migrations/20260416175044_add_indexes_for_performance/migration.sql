-- CreateIndex
CREATE INDEX "customers_brand_id_phone_idx" ON "customers"("brand_id", "phone");

-- CreateIndex
CREATE INDEX "invoices_brand_id_created_at_idx" ON "invoices"("brand_id", "created_at");

-- CreateIndex
CREATE INDEX "invoices_store_id_created_at_idx" ON "invoices"("store_id", "created_at");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_billing_id_idx" ON "invoices"("billing_id");

-- CreateIndex
CREATE INDEX "products_brand_id_barcode_idx" ON "products"("brand_id", "barcode");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_brand_id_store_id_idx" ON "users"("brand_id", "store_id");
