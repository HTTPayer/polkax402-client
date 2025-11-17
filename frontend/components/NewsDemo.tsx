'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  walletConnected: boolean;
  selectedAccount: string | null;
}

export default function NewsDemo({ walletConnected, selectedAccount }: Props) {
  const [query, setQuery] = useState('governance');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (useDemoMode: boolean = true) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = useDemoMode 
        ? `https://api.polkax402.com/api/polka-news/demo?query=${encodeURIComponent(query)}&paid=true`
        : `https://api.polkax402.com/api/polka-news?query=${encodeURIComponent(query)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setResult(data);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-2">
            Search Query
          </label>
          <div className="flex gap-3">
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., governance, parachains, staking..."
              className="flex-1 text-gray-400 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  fetchNews(true);
                }
              }}
            />
            <button
              onClick={() => fetchNews(true)}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Fetch News
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Demo mode: No real payment required for testing</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Request Successful</p>
              <p className="text-xs text-green-700 mt-1">
                Mode: <span className="font-mono">{result.mode || 'demo'}</span>
                {result.timestamp && (
                  <span className="ml-3">
                    Time: <span className="font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* News Content */}
          {result.news && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-semibold text-slate-900">Polkadot News Summary</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Query: <span className="font-mono">{result.query || query}</span>
                </p>
              </div>
              <div className="p-4">
                <div 
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ 
                    __html: result.news.replace(/\n/g, '<br/>') 
                  }}
                />
              </div>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-semibold text-slate-900">Sources ({result.sources.length})</h4>
              </div>
              <div className="p-4 space-y-2">
                {result.sources.map((source: any, idx: number) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-purple-600 truncate">
                        {source.title || source.url}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{source.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info (if available) */}
          {result.payment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {result.payment.from && (
                  <p>
                    From: <span className="font-mono text-xs">{result.payment.from}</span>
                  </p>
                )}
                {result.payment.amount && (
                  <p>
                    Amount: <span className="font-mono">{result.payment.amount}</span>
                  </p>
                )}
                {result.payment.confirmed !== undefined && (
                  <p>
                    Confirmed: <span className="font-semibold">{result.payment.confirmed ? 'Yes' : 'No'}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {!result && !error && !loading && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            <strong>How it works:</strong> Enter a search term related to Polkadot (e.g., governance, parachains, staking) 
            and click "Fetch News". The API will search for recent news, scrape the content using Firecrawl via HTTPayer, 
            and generate a summary using OpenAI.
          </p>
          <p className="text-sm text-purple-700 mt-2">
            In production mode, this would require an X402 payment signed by your Polkadot wallet.
          </p>
        </div>
      )}
    </div>
  );
}
