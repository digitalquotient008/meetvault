import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MeetVault — Barber Booking & No-Show Protection';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 24,
          }}
        >
          MeetVault
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Barber Booking &amp; No-Show Protection
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#64748b',
            marginTop: 16,
          }}
        >
          $25/mo — 14-day free trial
        </div>
      </div>
    ),
    { ...size },
  );
}
