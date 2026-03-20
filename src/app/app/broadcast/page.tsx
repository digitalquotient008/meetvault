import BroadcastClient from './BroadcastClient';
import { getAudienceCounts } from './actions';
import { PageHeader } from '@/components/ui/page-header';

export const metadata = { title: 'Broadcast' };

export default async function BroadcastPage() {
  const counts = await getAudienceCounts();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Broadcast email"
        description="Send a one-time email to your clients — announce events, out-of-office days, promotions, or anything else."
      />
      <BroadcastClient counts={counts} />
    </div>
  );
}
