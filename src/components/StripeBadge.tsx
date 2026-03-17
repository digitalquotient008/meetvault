/**
 * "Powered by Stripe" trust badge — text only, no SVG logo.
 * Use near payment mentions for instant trust signal.
 */
export default function StripeBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
      <span className="font-bold text-[#635BFF]">stripe</span>
      <span className="font-medium">Payments powered by Stripe</span>
    </span>
  );
}
