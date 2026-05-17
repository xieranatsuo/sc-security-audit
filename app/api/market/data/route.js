/**
 * GET /api/market/data?symbols=ETH,BNB,MATIC&vs=usd
 * Get market data for blockchain tokens.
 * Source: Binance public API (no key required).
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';

const SYMBOL_MAP = {
  ETH: 'ETHUSDT',
  BNB: 'BNBUSDT',
  MATIC: 'MATICUSDT',
  ARB: 'ARBUSDT',
  BTC: 'BTCUSDT',
};

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || 'ETH,BNB,MATIC';
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

    const prices = [];

    for (const symbol of symbols) {
      const binanceSymbol = SYMBOL_MAP[symbol];
      if (!binanceSymbol) continue;

      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`,
          { next: { revalidate: 30 } }
        );

        if (res.ok) {
          const data = await res.json();
          prices.push({
            symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.quoteVolume),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
          });
        }
      } catch {
        // Skip failed symbols
      }
    }

    return NextResponse.json(successEnvelope({
      prices,
      source: 'binance',
      vs: 'usd',
    }, { requestId }));
  } catch (error) {
    console.error('[market/data]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
