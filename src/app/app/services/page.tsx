import { requireShopAccess } from '@/lib/auth';
import { listServices } from '@/lib/services/service';
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
  const { shopId } = await requireShopAccess();
  const services = await listServices(shopId);

  const serialized = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMin: s.durationMin,
    price: s.price,
    category: s.category,
    isActive: s.isActive,
  }));

  return <ServicesClient services={serialized} />;
}
