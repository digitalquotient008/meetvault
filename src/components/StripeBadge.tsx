/**
 * "Powered by Stripe" trust badge — inline SVG, no external dependencies.
 * Use near payment mentions for instant trust signal.
 */
export default function StripeBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg className="h-5" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
        <path d="M5 10.2c0-.7.6-1 1.5-1 1.4 0 3.1.4 4.5 1.2V6.2C9.5 5.6 8 5.2 6.5 5.2 2.7 5.2 0 7.3 0 10.5c0 5 6.8 4.2 6.8 6.3 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.5v4.3c1.7.7 3.3 1 4.9 1 3.9 0 6.6-2 6.6-5.2C11.7 11 5 11.9 5 10.2zM16.2 2l-4.6 1v4.2l-1.4.6v3.5h1.4v5.8c0 2.4 1.2 3.4 3.4 3.4 1 0 1.8-.2 2.3-.4v-3.4c-.4.1-1 .2-1.3.2-.7 0-1.2-.3-1.2-1.2v-4.4h1.3V7.2h-1.3V2zM22.5 8.3l-.3-1.1h-4v13.3h4.6v-9c1.1-1.4 2.9-1.2 3.5-1v-4.3c-.6-.2-2.8-.6-3.8 2.1zM27.8 7.2h4.6v13.3h-4.6V7.2zm0-5.2l4.6-1v4l-4.6 1V2zM39.2 5.2c-1.7 0-2.8.8-3.4 1.4l-.2-1.1h-4.1v17.8l4.6-1v-4.3c.6.5 1.5 1.1 3 1.1 3 0 5.8-2.5 5.8-7.8 0-4.9-2.7-6.1-5.7-6.1zm-1 10c-1 0-1.6-.4-2-.8V10c.4-.5 1-.9 2-.9 1.5 0 2.5 1.7 2.5 3.1 0 1.8-1 3-2.5 3zM55.7 11.3c0-4.5-2.2-6.1-4-6.1-1.8 0-3.3.8-4 2.1l-.3-1.8h-4.1v13.3h4.6v-7.4c0-1.5.8-2.5 2.2-2.5 1.3 0 1.9.8 1.9 2.5v7.4H56v-7.5z" fill="#635BFF"/>
      </svg>
      <span className="text-[10px] text-slate-500 font-medium">Powered by Stripe</span>
    </div>
  );
}
