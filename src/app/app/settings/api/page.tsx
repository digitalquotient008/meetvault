import { requireShopAccess } from '@/lib/auth';
import { listApiKeys } from '@/lib/services/api-keys';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink } from 'lucide-react';
import ApiKeysClient from './ApiKeysClient';

export default async function ApiSettingsPage() {
  const { shopId } = await requireShopAccess();
  const [keys, shop] = await Promise.all([
    listApiKeys(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { slug: true } }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://meetvault.app';
  const embedCode = `<script src="${appUrl}/embed.js" data-shop="${shop?.slug ?? 'your-shop'}" async></script>`;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="API & Integrations"
        description="Connect MeetVault to your website or build custom integrations"
      />

      {/* Embed widget */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Code className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Embed booking on your website</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Add this script to your website to show a &ldquo;Book Now&rdquo; button. Works on any site — Wix, Squarespace, WordPress, or custom.
            </p>
          </div>
        </div>
        <div className="bg-slate-950 rounded-xl p-4 mb-3">
          <code className="text-xs text-amber-400 font-mono break-all leading-relaxed">
            {embedCode}
          </code>
        </div>
        <p className="text-slate-500 text-xs">
          Paste this before the closing <code className="text-slate-400">&lt;/body&gt;</code> tag on any page where you want the booking button to appear.
        </p>
      </Card>

      {/* API docs link */}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">REST API</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Build custom integrations with the MeetVault API.
          </p>
        </div>
        <Button variant="secondary" size="sm" href="/developers">
          <ExternalLink className="w-4 h-4" />
          View docs
        </Button>
      </Card>

      {/* API Keys */}
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
