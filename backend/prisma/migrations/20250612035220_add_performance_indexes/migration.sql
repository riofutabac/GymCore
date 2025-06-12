-- CreateIndex
CREATE INDEX "access_logs_gymId_idx" ON "access_logs"("gymId");

-- CreateIndex
CREATE INDEX "access_logs_userId_idx" ON "access_logs"("userId");

-- CreateIndex
CREATE INDEX "access_logs_createdAt_idx" ON "access_logs"("createdAt");

-- CreateIndex
CREATE INDEX "gyms_ownerId_idx" ON "gyms"("ownerId");

-- CreateIndex
CREATE INDEX "gyms_managerId_idx" ON "gyms"("managerId");

-- CreateIndex
CREATE INDEX "gyms_isActive_idx" ON "gyms"("isActive");

-- CreateIndex
CREATE INDEX "products_gymId_idx" ON "products"("gymId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "sales_gymId_idx" ON "sales"("gymId");

-- CreateIndex
CREATE INDEX "sales_sellerId_idx" ON "sales"("sellerId");

-- CreateIndex
CREATE INDEX "sales_createdAt_idx" ON "sales"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_workingAtGymId_idx" ON "users"("workingAtGymId");
