import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { listBarberProfiles } from '@/lib/services/barber';
import { prisma } from '@/lib/db';
import { UserCog, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StaffPage() {
  const { shopId } = await requireShopAccess();
  const [staff, shop] = await Promise.all([
    listBarberProfiles(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { subscriptionStatus: true } }),
  ]);
  const isStarter = shop?.subscriptionStatus === 'active' || shop?.subscriptionStatus === 'trialing';
  const atLimit = isStarter && staff.length >= 1;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Staff"
        description="Your team and booking availability"
        badge={staff.length > 0 ? <Badge>{staff.length} member{staff.length !== 1 ? 's' : ''}</Badge> : undefined}
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-6 h-6" />}
          title="No staff yet"
          description="Add staff members during onboarding or setup to enable booking."
        />
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Name</TableHeader>
            <TableHeader>Booking</TableHeader>
          </TableHead>
          <TableBody>
            {staff.map((b) => {
              const initials = b.displayName
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <span className="text-amber-400 text-xs font-bold">{initials}</span>
                      </div>
                      <span className="font-medium text-white">{b.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.isBookable ? 'success' : 'neutral'} dot>
                      {b.isBookable ? 'Bookable' : 'Not bookable'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {atLimit && (
        <Card className="mt-6 border-blue-500/20 bg-blue-500/[0.03]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Need more barbers?</h3>
              <p className="text-slate-400 text-sm mb-4">
                The Starter plan includes 1 staff member. Upgrade to Team for unlimited barbers, per-barber scheduling, commission tracking, and more.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" href="/contact?plan=team">
                  Contact Sales
                </Button>
                <Link href="/contact?plan=team" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  or contact sales
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
