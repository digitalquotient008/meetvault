'use client';

import { useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { generateApiKeyAction, revokeApiKeyAction } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type ApiKeyEntry = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKeyEntry[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateApiKeyAction();
      setNewKey(result.rawKey);
      setKeys((prev) => [
        { id: result.id, name: 'Default', keyPrefix: result.keyPrefix, lastUsedAt: null, revokedAt: null, createdAt: new Date() },
        ...prev,
      ]);
    } catch {
      alert('Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm('Revoke this API key? Any integrations using it will stop working immediately.')) return;
    try {
      await revokeApiKeyAction(keyId);
      setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, revokedAt: new Date() } : k)));
    } catch {
      alert('Failed to revoke key');
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="space-y-6">
      {/* New key banner */}
      {newKey && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-300 text-sm font-medium mb-2">
                API key generated — copy it now. You won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-950/50 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono break-all">
                  {showKey ? newKey : '•'.repeat(40)}
                </code>
                <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">API Keys</h2>
          <p className="text-slate-500 text-sm mt-0.5">Use API keys to access the MeetVault API from your website or application.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} size="sm">
          <Plus className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Key'}
        </Button>
      </div>

      {/* Active keys */}
      {activeKeys.length === 0 ? (
        <Card className="text-center py-8">
          <Key className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No API keys yet. Generate one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {activeKeys.map((k) => (
            <Card key={k.id} padding="sm" className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">{k.name}</p>
                  <p className="text-slate-500 text-xs font-mono truncate">{k.keyPrefix}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {k.lastUsedAt && (
                  <span className="text-slate-600 text-xs">
                    Last used {new Date(k.lastUsedAt).toLocaleDateString()}
                  </span>
                )}
                <Badge variant="success" dot>Active</Badge>
                <button
                  onClick={() => handleRevoke(k.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Revoke"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <p className="text-slate-600 text-xs uppercase tracking-wider font-medium mb-2">Revoked</p>
          <div className="space-y-2">
            {revokedKeys.map((k) => (
              <Card key={k.id} padding="sm" className="flex items-center justify-between gap-4 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{k.name}</p>
                    <p className="text-slate-600 text-xs font-mono">{k.keyPrefix}</p>
                  </div>
                </div>
                <Badge variant="danger">Revoked</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
