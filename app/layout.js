import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const SITE_URL = 'https://smart-contract-audit-platform.vercel.app';
const SITE_NAME = 'Smart Contract Audit Platform';
const SITE_DESC = 'Production-grade multi-chain smart contract security analysis. Scan Ethereum, BSC, Polygon, and Arbitrum contracts for vulnerabilities in seconds.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Multi-Chain Security Scanner`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: ['smart contract audit', 'solidity security', 'vulnerability scanner', 'reentrancy detection', 'EVM audit', 'blockchain security', 'DeFi audit', 'contract analysis'],
  authors: [{ name: 'Audit Platform Team' }],
  creator: 'Audit Platform',
  publisher: 'Audit Platform',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Multi-Chain Security Scanner`,
    description: SITE_DESC,
    images: [
      { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Multi-Chain Security Scanner`,
    description: SITE_DESC,
    images: [`${SITE_URL}/og-image.png`],
    creator: '@auditplatform',
  },
  alternates: { canonical: SITE_URL },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Reentrancy vulnerability detection',
      'Integer overflow/underflow analysis',
      'Flash loan attack vector scanning',
      'Proxy contract safety checks',
      'Multi-chain support (Ethereum, BSC, Polygon, Arbitrum)',
      'Go-powered concurrent bytecode scanning',
      'Python source code analysis engine',
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-surface-0">
        <noscript>
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'system-ui', color: '#fafafa', background: '#09090b' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Smart Contract Audit Platform</h1>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
              JavaScript is required to use this application. Please enable JavaScript in your browser settings to access the smart contract security audit tools.
            </p>
          </div>
        </noscript>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
