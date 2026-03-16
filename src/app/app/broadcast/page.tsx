import BroadcastClient from './BroadcastClient';
import { getAudienceCounts } from './actions';

export const metadata = { title: 'Broadcast' };

export default async function BroadcastPage() {
  const counts = await getAudienceCounts();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Broadcast email</h1>
      <p className="text-slate-400 text-sm mb-8">
        Send a one-time email to your clients — announce events, out-of-office days, promotions, or anything else.
      </p>
      <BroadcastClient counts={counts} />
    </div>
  );
}
