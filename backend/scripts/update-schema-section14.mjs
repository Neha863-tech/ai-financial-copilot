import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Add enums if not present
const enumsToAdd = `
enum SessionStatus {
  ACTIVE
  REVOKED
  EXPIRED
}

enum LoginStatus {
  SUCCESS
  FAILED
}

enum ActivityCategory {
  ACCOUNT
  FINANCIAL
  PAYMENTS
  SECURITY
  INTEGRATION
}
`;

if (!content.includes('enum SessionStatus')) {
  content = enumsToAdd.trim() + '\n\n' + content;
}

// 2. Extend User model with new fields and relations
const userFieldsToAdd = `
  avatarUrl              String?
  phone                  String?
  username               String?            @unique
  dateOfBirth            DateTime?          @db.Date
  country                String?            @default("India")
  status                 String             @default("ACTIVE")
  plan                   String             @default("PRO")
  emailVerified          Boolean            @default(true)
  phoneVerified          Boolean            @default(false)
  twoFactorEnabled       Boolean            @default(false)
  lastLoginAt            DateTime?          @db.Timestamptz(6)
  lastSeenAt             DateTime?          @db.Timestamptz(6)
  lastLogoutAt           DateTime?          @db.Timestamptz(6)
  lastPasswordChangeAt   DateTime?          @db.Timestamptz(6)
  sessions               UserSession[]
  loginEvents            LoginEvent[]
  activities             UserActivity[]
  notificationPreference NotificationPreference?
`;

if (!content.includes('sessions               UserSession[]')) {
  content = content.replace(
    '  integrations      ConnectedIntegration[]\n}',
    `  integrations      ConnectedIntegration[]\n${userFieldsToAdd}\n}`
  );
}

// 3. Extend AuditLog model if needed
if (!content.includes('riskLevel')) {
  content = content.replace(
    '  userAgent  String?\n  createdAt  DateTime @default(now()) @db.Timestamptz(6)',
    '  userAgent     String?\n  riskLevel     String   @default("LOW")\n  outcome       String   @default("SUCCESS")\n  requestId     String?\n  changeDetails Json?\n  createdAt     DateTime @default(now()) @db.Timestamptz(6)'
  );
}

// 4. Append new models: UserSession, LoginEvent, UserActivity, NotificationPreference
const newModels = `
model UserSession {
  id               String        @id @default(uuid()) @db.Uuid
  userId           String        @db.Uuid
  sessionTokenHash String        @unique
  deviceName       String
  browser          String
  operatingSystem  String
  ipAddress        String?
  location         String?
  status           SessionStatus @default(ACTIVE)
  createdAt        DateTime      @default(now()) @db.Timestamptz(6)
  lastActiveAt     DateTime      @default(now()) @db.Timestamptz(6)
  expiresAt        DateTime      @db.Timestamptz(6)
  revokedAt        DateTime?     @db.Timestamptz(6)
  user             User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, lastActiveAt])
}

model LoginEvent {
  id            String      @id @default(uuid()) @db.Uuid
  userId        String?     @db.Uuid
  status        LoginStatus
  failureReason String?
  ipAddress     String?
  userAgent     String?
  device        String?
  browser       String?
  os            String?
  location      String?
  createdAt     DateTime    @default(now()) @db.Timestamptz(6)
  user          User?       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
}

model UserActivity {
  id           String           @id @default(uuid()) @db.Uuid
  userId       String           @db.Uuid
  category     ActivityCategory @default(ACCOUNT)
  eventType    String
  title        String
  description  String
  status       String           @default("SUCCESS")
  entityType   String?
  entityId     String?
  sourceDevice String?
  ipAddress    String?
  metadata     Json?
  createdAt    DateTime         @default(now()) @db.Timestamptz(6)
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, category, createdAt])
}

model NotificationPreference {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @unique @db.Uuid
  emailNewLogin       Boolean  @default(true)
  emailFailedLogin    Boolean  @default(true)
  emailPasswordChange Boolean  @default(true)
  emailBudgetAlert    Boolean  @default(true)
  emailBillDue        Boolean  @default(true)
  emailWeeklyDigest   Boolean  @default(false)
  pushOverspend       Boolean  @default(true)
  inAppAlerts         Boolean  @default(true)
  updatedAt           DateTime @updatedAt @db.Timestamptz(6)
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;

if (!content.includes('model UserSession')) {
  content += '\n' + newModels.trim() + '\n';
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Successfully updated schema.prisma for Section 14!');
