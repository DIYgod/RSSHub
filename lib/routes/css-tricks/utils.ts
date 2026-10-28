import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const rootUrl = 'https://css-tricks.com';

type Card = DataItem & { link: string };

export async function extractMiniCards(cardselector: string, titleSelector: string = '', descSelector: string = '') {
    const response = await ofetch(rootUrl);
    const $ = load(response);
    return {
        title: titleSelector ? $(titleSelector).text().trim() : '',
        description: descSelector ? $(descSelector).text().trim() : '',
        cards: $(cardselector).toArray(),
    };
}

function extractCardsInfo(cards, mini: boolean): Card[] {
    return cards.map((card): Card => {
        const $ = load(card);
        const articleLink = mini ? $('h3.mini-card-title a:not(.aal_anchor)').first() : $('div.article-article h2 a, div.article-article h1 a').first();
        const publishedAt = $('time').first().attr('datetime');
        return {
            title: articleLink.text(),
            link: new URL(articleLink.attr('href')!, rootUrl).href,
            image: $('div.article-thumbnail-wrap img').first().attr('src'),
            pubDate: publishedAt ? timezone(parseDate(publishedAt), 0) : undefined,
        };
    });
}

export function processWithWp(cards, mini: boolean = false, _type: string = 'posts') {
    return Promise.all(
        extractCardsInfo(cards, mini).map((card) =>
            cache.tryGet(card.link, async () => {
                const response = await ofetch(card.link);
                const $ = load(response);
                const article = $('.article-content').first();
                if (!article.length) {
                    throw new Error(`CSS-Tricks article content was not found at ${card.link}.`);
                }
                article.find('.in-article-cards').remove();
                const description = article.html();
                const publishedAt = $('meta[property="article:published_time"]').attr('content');
                const modifiedAt = $('meta[property="article:modified_time"]').attr('content');
                const author = $('.author-name').first();
                const image = $('meta[property="og:image"]').attr('content') || card.image;
                return {
                    ...card,
                    title: $('main h1').first().text() || card.title,
                    link: $('link[rel="canonical"]').attr('href') || card.link,
                    description,
                    summary: $('meta[name="description"]').attr('content'),
                    image,
                    pubDate: publishedAt ? parseDate(publishedAt) : card.pubDate,
                    updated: modifiedAt ? parseDate(modifiedAt) : undefined,
                    author: author.length ? [{ name: author.text().trim(), url: author.attr('href') }] : undefined,
                    category: $('meta[property="article:tag"], meta[property="article:section"]')
                        .toArray()
                        .map((tag) => $(tag).attr('content')!)
                        .filter(Boolean),
                    content: {
                        html: description,
                        text: article.text(),
                    },
                } satisfies DataItem;
            })
        )
    );
}
