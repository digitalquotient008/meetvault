import { prisma } from '@/lib/db';

type AuditParams = {
  shopId: string;
  entityType: string;
  entityId: string;
  action: string;
  afterJson?: string;
  beforeJson?: string;
  actorUserId?: string | null;
};

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        shopId: params.shopId,
        actorUserId: params.actorUserId ?? null,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        beforeJson: params.beforeJson ?? null,
        afterJson: params.afterJson ?? null,
      },
    });
  } catch (e) {
    console.error('Audit log write failed:', e);
  }
}
