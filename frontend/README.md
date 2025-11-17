# Polkax402 Frontend

Modern, minimalist web interface for the Polkax402 API - demonstrating the HTTP 402 Payment Required protocol with Polkadot blockchain payments.

## 🚀 Features

- **Polkadot Wallet Integration**: Connect with Talisman, SubWallet, or Polkadot.js extension
- **Live News Demo**: Fetch Polkadot news with X402 protocol
- **Beautiful UI**: Clean, modern design with Tailwind CSS
- **Responsive**: Works on desktop, tablet, and mobile
- **HTTPayer Integration**: Powered by HTTPayer.com for seamless payments

## 🛠️ Tech Stack

- **Next.js 15** - Latest React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Polkadot Extension** - Wallet connectivity
- **Lucide React** - Beautiful icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The frontend will be available at `http://localhost:3001` (or the next available port).

## 🔧 Configuration

Make sure the backend API is running on `http://localhost:3000` before using the frontend.

To change the API URL, update the fetch calls in `components/NewsDemo.tsx`.

## 🌐 Polkadot Wallet Setup

To use the payment features, you need a Polkadot wallet extension:

1. **Talisman** (Recommended): [talisman.xyz](https://talisman.xyz)
2. **SubWallet**: [subwallet.app](https://subwallet.app)
3. **Polkadot.js**: [polkadot.js.org/extension](https://polkadot.js.org/extension/)

After installing, create or import an account and connect it through the web interface.

## 📖 Usage

1. **Start Backend**: Make sure the Polkax402 API server is running (`npm run dev` in the root directory)
2. **Start Frontend**: Run `npm run dev` in the frontend directory
3. **Connect Wallet**: Click "Connect Polkadot Wallet" and authorize the connection
4. **Try Demo**: Enter a search query (e.g., "governance") and click "Fetch News"
5. **View Results**: See the aggregated news summary powered by X402 payments

## 🎨 Design Philosophy

- **Minimalist**: Clean, distraction-free interface
- **Modern**: Latest design trends and best practices
- **Accessible**: WCAG compliant, keyboard navigation
- **Fast**: Optimized performance with Next.js 15

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/
│   ├── NewsDemo.tsx        # News fetching demo
│   └── PolkadotWalletConnect.tsx  # Wallet connection
└── public/                 # Static assets
```

## 🔗 Links

- **HTTPayer**: [httpayer.com](https://httpayer.com)
- **X402 Protocol**: [github.com/polkadot-api/x402](https://github.com/polkadot-api/x402)
- **Backend API Docs**: [localhost:3000/docs](http://localhost:3000/docs)

## 📄 License

MIT
