import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const rootUrl = 'https://css-tricks.com';

type Card = Pick<DataItem, 'pubDate'> & { link: string };

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
        const articleLink = mini ? $('h3 a:not(.aal_anchor)') : $('div.article-article h2 a, div.article-article h1 a');
        const publishedAt = $('time').attr('datetime');
        return {
            link: new URL(articleLink.attr('href')!, rootUrl).href,
            pubDate: publishedAt ? parseDate(publishedAt, 0) : undefined,
        };
    });
}

export function processWithWp(cards, mini: boolean = false, _type: string = 'posts') {
    return Promise.all(
        extractCardsInfo(cards, mini).map((card) =>
            cache.tryGet(card.link, async () => {
                const response = await ofetch(card.link);
                const $ = load(response);
                const article = $('.article-content');
                article.find('.in-article-cards').remove();
                const description = article.html();
                const publishedAt = $('meta[property="article:published_time"]').attr('content');
                const modifiedAt = $('meta[property="article:modified_time"]').attr('content');
                const author = $('.author-name');
                return {
                    ...card,
                    title: $('main h1').text(),
                    link: $('link[rel="canonical"]').attr('href'),
                    description,
                    summary: $('meta[name="description"]').attr('content'),
                    image: $('meta[property="og:image"]').attr('content'),
                    pubDate: publishedAt ? parseDate(publishedAt) : card.pubDate,
                    updated: modifiedAt ? parseDate(modifiedAt) : undefined,
                    author: author.length ? [{ name: author.text(), url: author.attr('href') }] : undefined,
                    category: $('meta[property="article:tag"], meta[property="article:section"]')
                        .toArray()
                        .map((tag) => $(tag).attr('content')!),
                    content: {
                        html: description,
                        text: article.text(),
                    },
                } satisfies DataItem;
            })
        )
    );
}
