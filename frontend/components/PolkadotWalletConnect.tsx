'use client';

import { useState, useEffect } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onConnect?: (connected: boolean, account: string | null) => void;
}

export default function PolkadotWalletConnect({ onConnect }: Props) {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionFound, setExtensionFound] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request authorization from Polkadot extension
      const extensions = await web3Enable('Polkax402 Demo');
      
      if (extensions.length === 0) {
        setError('No Polkadot extension found. Please install Talisman, SubWallet, or Polkadot.js extension.');
        setExtensionFound(false);
        setLoading(false);
        return;
      }

      setExtensionFound(true);

      // Get all accounts
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        setError('No accounts found. Please create an account in your Polkadot wallet.');
        setLoading(false);
        return;
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      onConnect?.(true, allAccounts[0].address);
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    onConnect?.(true, account.address);
  };

  const disconnect = () => {
    setSelectedAccount(null);
    onConnect?.(false, null);
  };

  return (
    <div className="space-y-4">
      {!selectedAccount ? (
        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Polkadot Wallet
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                {!extensionFound && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-700 font-medium">Install a Polkadot wallet:</p>
                    <ul className="text-xs text-red-700 space-y-1 ml-4">
                      <li>• <a href="https://talisman.xyz" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Talisman Wallet</a></li>
                      <li>• <a href="https://subwallet.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">SubWallet</a></li>
                      <li>• <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Polkadot.js Extension</a></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> You'll need a Polkadot wallet extension installed in your browser 
              (Talisman, SubWallet, or Polkadot.js) to sign payments and interact with the X402 protocol.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Wallet Connected</p>
                <p className="text-xs text-green-700 mt-1">
                  {selectedAccount.meta.name && (
                    <span className="font-medium">{selectedAccount.meta.name} • </span>
                  )}
                  <span className="font-mono">{selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-8)}</span>
                </p>
              </div>
            </div>
          </div>

          {accounts.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Account
              </label>
              <select
                value={selectedAccount.address}
                onChange={(e) => {
                  const account = accounts.find(acc => acc.address === e.target.value);
                  if (account) handleAccountChange(account);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {accounts.map((account) => (
                  <option key={account.address} value={account.address}>
                    {account.meta.name} ({account.address.slice(0, 8)}...{account.address.slice(-8)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
