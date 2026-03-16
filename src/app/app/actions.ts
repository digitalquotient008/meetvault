'use server';

import { requireShopAccess } from '@/lib/auth';
import {
  startAppointment,
  completeAppointment,
  cancelAppointment,
  markNoShowAppointment,
} from '@/lib/services/appointment';
import { addCustomerNote } from '@/lib/services/customer-notes';

type LifecycleAction = 'start' | 'complete' | 'cancel' | 'no-show';

export async function updateAppointmentStatusAction(appointmentId: string, action: LifecycleAction) {
  const { shopId } = await requireShopAccess();
  switch (action) {
    case 'start':
      return startAppointment(shopId, appointmentId);
    case 'complete':
      return completeAppointment(shopId, appointmentId);
    case 'cancel':
      return cancelAppointment(shopId, appointmentId);
    case 'no-show':
      return markNoShowAppointment(shopId, appointmentId);
    default:
      throw new Error('Invalid action');
  }
}

export async function addCustomerNoteAction(customerId: string, content: string) {
  const { shopId, userId } = await requireShopAccess();
  return addCustomerNote({ shopId, customerId, content, createdByUserId: userId });
}
