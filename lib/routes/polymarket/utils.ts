import { escape } from 'entities/escape';

import type { Event, Market } from './types';

export function formatOddsDisplay(market: Market): string {
    const outcomes = market.outcomes ? JSON.parse(market.outcomes) : [];
    const prices = market.outcomePrices ? JSON.parse(market.outcomePrices) : [];
    return prices.length > 0 ? outcomes.map((o: string, i: number) => `${o}: ${(Number(prices[i]) * 100).toFixed(1)}%`).join(' | ') : outcomes.join(' | ') || 'N/A';
}

export function formatEventDescription(event: Event): string {
    const marketsHtml = (event.markets || [])
        .slice(0, 3)
        .map((market) => `<li><strong>${escape(market.question)}</strong><br>${escape(formatOddsDisplay(market))}</li>`)
        .join('');

    return `
        ${event.description ? `<p>${escape(event.description)}</p>` : ''}
        <p><strong>Volume:</strong> $${(event.volume || 0).toLocaleString()}</p>
        ${marketsHtml ? `<h4>Markets:</h4><ul>${marketsHtml}</ul>` : ''}
        ${event.image ? `<img src="${escape(event.image)}" alt="${escape(event.title)}" style="max-width: 100%;">` : ''}
    `;
}
