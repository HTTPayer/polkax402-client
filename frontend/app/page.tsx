'use client';

import { useState } from 'react';
import { Wallet, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with Polkadot extension
const PolkadotWalletConnect = dynamic(
  () => import('@/components/PolkadotWalletConnect'),
  { ssr: false }
);

const NewsDemo = dynamic(
  () => import('@/components/NewsDemo'),
  { ssr: false }
);

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Polkax402</h1>
                <p className="text-xs text-slate-500">Pay-per-use API with X402</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://httpayer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                Powered by <span className="font-semibold">HTTPayer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            HTTP 402 Payment Required Protocol
          </div>
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Web3 Micropayments
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Access premium APIs with instant on-chain payments. No subscriptions, pay only for what you use.
          </p>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white mb-2">Live Demo</h3>
            <p className="text-purple-100">
              Try fetching Polkadot news with X402 payments
            </p>
          </div>
          
          <div className="p-8">
            <NewsDemo 
              walletConnected={walletConnected}
              selectedAccount={selectedAccount}
            />
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-slate-900">Connect Wallet</h3>
          </div>
          <PolkadotWalletConnect 
            onConnect={(connected, account) => {
              setWalletConnected(connected);
              setSelectedAccount(account);
            }}
          />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">X402 Protocol</h4>
            <p className="text-slate-600">
              HTTP 402 standard for web payments. Request → Pay → Access in one flow.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">On-Chain Verification</h4>
            <p className="text-slate-600">
              Every payment is verified on Polkadot blockchain for trustless transactions.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Pay Per Use</h4>
            <p className="text-slate-600">
              Micro-transactions for API calls. No subscriptions, only pay for what you consume.
            </p>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">About This Project</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">What is Polkax402?</h4>
              <p className="text-slate-300 mb-4">
                A production-ready implementation of the HTTP 402 Payment Required protocol, 
                combining Polkadot blockchain payments with premium API access. Built with:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span><strong>X402 Protocol:</strong> HTTP standard for web payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span><strong>Polkadot:</strong> On-chain payment verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span><strong>Firecrawl:</strong> News aggregation via HTTPayer</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span><strong>OpenAI:</strong> LLM processing for summaries</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">How It Works</h4>
              <ol className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Client requests protected API endpoint</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Server responds with 402 Payment Required + instructions</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Client signs payment with Polkadot wallet</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>Payment verified on-chain via facilitator</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <span>Access granted, response returned with payment receipt</span>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-6">
                <a href="https://github.com/polkadot-api/x402" target="_blank" rel="noopener noreferrer" 
                   className="text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1">
                  X402 Protocol <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://httpayer.com" target="_blank" rel="noopener noreferrer"
                   className="text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1">
                  HTTPayer <ExternalLink className="w-3 h-3" />
                </a>
                <a href="http://localhost:3000/docs" target="_blank" rel="noopener noreferrer"
                   className="text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1">
                  API Docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-sm text-slate-400">
                MIT License • Built with ❤️ for Web3
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Polkax402</span>
              <span className="text-slate-400">•</span>
              <span className="text-sm">Next-gen API monetization</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="https://httpayer.com" target="_blank" rel="noopener noreferrer"
                 className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Powered by HTTPayer.com
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                 className="text-slate-600 hover:text-slate-900 transition-colors">
                GitHub
              </a>
              <a href="http://localhost:3000/docs" target="_blank" rel="noopener noreferrer"
                 className="text-slate-600 hover:text-slate-900 transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
