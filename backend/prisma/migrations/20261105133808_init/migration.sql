-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'CSV', 'PAYPAL_REPORTING', 'PAYPAL_CHECKOUT', 'DEMO');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CategoryDirection" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');

-- CreateEnum
CREATE TYPE "CategorizationMethod" AS ENUM ('RULE', 'AI', 'USER', 'NONE');

-- CreateEnum
CREATE TYPE "PayPalEnvironment" AS ENUM ('SANDBOX', 'LIVE');

-- CreateEnum
CREATE TYPE "PayPalConnectionStatus" AS ENUM ('NOT_CONFIGURED', 'ACTIVE', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RecurringConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('DETECTED', 'CONFIRMED', 'DISMISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentOrderStatus" AS ENUM ('CREATED', 'APPROVED', 'COMPLETED', 'FAILED', 'VOIDED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "preferredCurrency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "name" TEXT NOT NULL,
    "direction" "CategoryDirection" NOT NULL DEFAULT 'BOTH',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID,
    "source" "TransactionSource" NOT NULL,
    "externalId" TEXT,
    "dedupeKey" TEXT,
    "merchant" TEXT,
    "description" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "transactionDate" TIMESTAMPTZ(6) NOT NULL,
    "categorizationMethod" "CategorizationMethod" DEFAULT 'NONE',
    "categoryConfidence" DECIMAL(5,4),
    "rawProviderData" JSONB,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID,
    "scopeKey" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPalConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "environment" "PayPalEnvironment" NOT NULL,
    "merchantAccountReference" TEXT,
    "webhookId" TEXT,
    "status" "PayPalConnectionStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "lastSyncedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PayPalConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringPayment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "merchant" TEXT NOT NULL,
    "merchantKey" TEXT NOT NULL,
    "expectedAmount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL DEFAULT 'UNKNOWN',
    "nextDueAt" TIMESTAMPTZ(6),
    "confidence" "RecurringConfidence" NOT NULL DEFAULT 'LOW',
    "status" "RecurringStatus" NOT NULL DEFAULT 'DETECTED',
    "lastObservedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RecurringPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "recurringPaymentId" UUID,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(18,2),
    "currency" VARCHAR(3),
    "dueAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "ConversationRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolName" TEXT,
    "toolCallId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPalWebhookEvent" (
    "id" UUID NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "resourceId" TEXT,
    "payload" JSONB,
    "processingStatus" "WebhookProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PayPalWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "paypalOrderId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "PaymentOrderStatus" NOT NULL DEFAULT 'CREATED',
    "transactionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Category_direction_isSystem_idx" ON "Category"("direction", "isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

-- CreateIndex
CREATE INDEX "Transaction_userId_transactionDate_idx" ON "Transaction"("userId", "transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_userId_categoryId_transactionDate_idx" ON "Transaction"("userId", "categoryId", "transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_userId_direction_status_transactionDate_idx" ON "Transaction"("userId", "direction", "status", "transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_userId_dedupeKey_idx" ON "Transaction"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_userId_source_externalId_key" ON "Transaction"("userId", "source", "externalId");

-- CreateIndex
CREATE INDEX "Budget_userId_periodStart_periodEnd_idx" ON "Budget"("userId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_scopeKey_periodStart_currency_key" ON "Budget"("userId", "scopeKey", "periodStart", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "PayPalConnection_userId_environment_key" ON "PayPalConnection"("userId", "environment");

-- CreateIndex
CREATE INDEX "RecurringPayment_userId_status_nextDueAt_idx" ON "RecurringPayment"("userId", "status", "nextDueAt");

-- CreateIndex
CREATE INDEX "RecurringPayment_userId_merchantKey_idx" ON "RecurringPayment"("userId", "merchantKey");

-- CreateIndex
CREATE INDEX "Reminder_userId_status_dueAt_idx" ON "Reminder"("userId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "AIConversation_userId_updatedAt_idx" ON "AIConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PayPalWebhookEvent_providerEventId_key" ON "PayPalWebhookEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "PayPalWebhookEvent_eventType_receivedAt_idx" ON "PayPalWebhookEvent"("eventType", "receivedAt");

-- CreateIndex
CREATE INDEX "PayPalWebhookEvent_resourceId_idx" ON "PayPalWebhookEvent"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_paypalOrderId_key" ON "PaymentOrder"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_transactionId_key" ON "PaymentOrder"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentOrder_userId_createdAt_idx" ON "PaymentOrder"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPalConnection" ADD CONSTRAINT "PayPalConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringPayment" ADD CONSTRAINT "RecurringPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_recurringPaymentId_fkey" FOREIGN KEY ("recurringPaymentId") REFERENCES "RecurringPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
