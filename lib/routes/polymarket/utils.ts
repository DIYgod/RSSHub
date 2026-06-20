import type { Event, Market } from './types';

export function formatOddsDisplay(market: Market): string {
    const outcomes = market.outcomes ? JSON.parse(market.outcomes) : [];
    const prices = market.outcomePrices ? JSON.parse(market.outcomePrices) : [];
    return prices.length > 0 ? outcomes.map((o: string, i: number) => `${o}: ${(Number(prices[i]) * 100).toFixed(1)}%`).join(' | ') : outcomes.join(' | ') || 'N/A';
}

export function formatEventDescription(event: Event): string {
    const marketsHtml = (event.markets || [])
        .slice(0, 3)
        .map((market) => `<li><strong>${market.question}</strong><br>${formatOddsDisplay(market)}</li>`)
        .join('');

    return `
        ${event.description ? `<p>${event.description}</p>` : ''}
        <p><strong>Volume:</strong> $${Number(event.volume || 0).toLocaleString()}</p>
        ${marketsHtml ? `<h4>Markets:</h4><ul>${marketsHtml}</ul>` : ''}
        ${event.image ? `<img src="${event.image}" alt="${event.title}" style="max-width: 100%;">` : ''}
    `;
}
