import { Code, Key, Calendar, Scissors, Clock, Send } from 'lucide-react';

export const metadata = {
  title: 'API Documentation',
  description: 'MeetVault REST API and embeddable booking widget documentation for developers.',
};

function Endpoint({ method, path, description, params, body, response }: {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  body?: string;
  response: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${method === 'GET' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
          {method}
        </span>
        <code className="text-white text-sm font-mono">{path}</code>
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-slate-400 text-sm">{description}</p>
        {params && params.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Parameters</p>
            <div className="space-y-1.5">
              {params.map((p) => (
                <div key={p.name} className="flex items-start gap-2 text-sm">
                  <code className="text-amber-400 text-xs bg-slate-800 px-1.5 py-0.5 rounded">{p.name}</code>
                  <span className="text-slate-600 text-xs">{p.type}</span>
                  {p.required && <span className="text-red-400 text-xs">required</span>}
                  <span className="text-slate-500 text-xs">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {body && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Request body</p>
            <pre className="bg-slate-950 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto">{body}</pre>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Response</p>
          <pre className="bg-slate-950 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto">{response}</pre>
        </div>
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">For Developers</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">MeetVault API</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Embed booking on your website or build custom integrations with the MeetVault REST API.
            </p>
          </div>

          {/* Quick start */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-400" />
              Quick Start — Embed Widget
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Add a &ldquo;Book Now&rdquo; button to any website with one line of code. No API key required.
            </p>
            <pre className="bg-slate-950 rounded-xl p-4 text-sm text-amber-400 font-mono overflow-x-auto mb-4">
{`<script src="https://meetvault.app/embed.js"
  data-shop="your-shop-slug"
  async></script>`}
            </pre>
            <p className="text-slate-500 text-xs mb-3">Optional attributes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { attr: 'data-text', desc: 'Button text (default: "Book Now")' },
                { attr: 'data-position', desc: '"bottom-right", "bottom-left", "top-right", "top-left"' },
                { attr: 'data-color', desc: 'Button color hex (default: #f59e0b)' },
              ].map((item) => (
                <div key={item.attr} className="flex items-start gap-2">
                  <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{item.attr}</code>
                  <span className="text-slate-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Authentication
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              All API endpoints require a Bearer token. Generate an API key from your{' '}
              <span className="text-amber-400">Dashboard → Settings → API</span>.
            </p>
            <pre className="bg-slate-950 rounded-xl p-4 text-sm text-slate-300 font-mono overflow-x-auto">
{`curl https://meetvault.app/api/v1/services \\
  -H "Authorization: Bearer mv_live_your_api_key_here"`}
            </pre>
          </div>

          {/* Endpoints */}
          <h2 className="text-xl font-bold text-white mb-6">Endpoints</h2>
          <div className="space-y-6">
            <Endpoint
              method="GET"
              path="/api/v1/shop"
              description="Get your shop's basic info."
              response={`{
  "name": "Classic Cuts",
  "slug": "classic-cuts",
  "timezone": "America/New_York",
  "logoUrl": null,
  "deposit": { "type": "FIXED", "value": 10 }
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/services"
              description="List all active services."
              response={`{
  "services": [
    {
      "id": "clx...",
      "name": "Skin Fade",
      "description": "Clean skin fade with lineup",
      "durationMin": 40,
      "price": 35,
      "category": "mens"
    }
  ]
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/availability"
              description="Get available time slots for a service."
              params={[
                { name: 'serviceId', type: 'string', required: true, desc: 'Service ID' },
                { name: 'dateFrom', type: 'ISO date', required: true, desc: 'Start of date range' },
                { name: 'dateTo', type: 'ISO date', required: true, desc: 'End of date range' },
                { name: 'barberProfileId', type: 'string', required: false, desc: 'Filter by specific barber' },
              ]}
              response={`{
  "slots": [
    { "start": "2026-03-21T10:00:00.000Z", "barberProfileId": "clx..." },
    { "start": "2026-03-21T10:30:00.000Z", "barberProfileId": "clx..." }
  ]
}`}
            />

            <Endpoint
              method="POST"
              path="/api/v1/bookings"
              description="Create a new appointment."
              body={`{
  "serviceId": "clx...",
  "barberProfileId": "clx...",
  "startDateTime": "2026-03-21T10:00:00.000Z",
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567"
  }
}`}
              response={`{
  "booking": {
    "id": "clx...",
    "status": "PENDING",
    "startDateTime": "2026-03-21T10:00:00.000Z",
    "endDateTime": "2026-03-21T10:40:00.000Z",
    "confirmationCode": "A1B2C3D4",
    "bookingUrl": "https://meetvault.app/book/..."
  }
}`}
            />
          </div>

          {/* Rate limits */}
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Rate Limits</h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p><code className="text-amber-400 text-xs bg-slate-800 px-1.5 py-0.5 rounded">GET</code> endpoints: 60 requests/minute per API key</p>
              <p><code className="text-amber-400 text-xs bg-slate-800 px-1.5 py-0.5 rounded">POST</code> endpoints: 10 requests/minute per API key</p>
              <p>Rate limit headers are included in every response.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
