import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const rootUrl = 'https://css-tricks.com';
type Card = {
    id: string;
    title: string;
    link: string;
    thumbnail: string;
};

export async function extractMiniCards(selector) {
    const response = await ofetch(rootUrl);
    const $ = load(response);
    return $(selector).toArray();
}

function extractCardsInfo(cards) {
    return cards.map((card) => {
        const $ = load(card);
        const id = $(card).attr('id');
        const thumbnail = $(card).find('div.article-thumbnail-wrap > a >img').attr('src');
        const article = $('div.article-article');
        const title = article.find('h2 > a').text();
        const link = article.find('h2 > a').attr('href');
        return {
            id,
            title,
            link,
            thumbnail,
        } as Card;
    });
}

function extractMiniCardsInfo(cards) {
    return cards.map((card) => {
        const $ = load(card);
        const id = $(card).attr('id')?.replace('mini-', '');
        const thumbnail = '';
        const title = $('h3.mini-card-title').find('a:not(.aal_anchor)').text();
        const link = $('h3.mini-card-title').find('a:not(.aal_anchor)').attr('href');
        return {
            id,
            title,
            link,
            thumbnail,
        } as Card;
    });
}

export async function processCards(cards, mini: boolean = false, dateSort: boolean = true) {
    const cardsWithInfo = mini ? extractMiniCardsInfo(cards) : extractCardsInfo(cards);
    const cardsPromise = await Promise.allSettled(
        cardsWithInfo.map(async (card: Card) => await fetchCardDetails(card, dateSort))
    );
    return cardsPromise.filter((card) => card.status === 'fulfilled').map((card) => card.value as DataItem);
}

export async function fetchCardDetails(card: Card, dateSort: boolean) {
    return await cache.tryGet(`css-tricks:${card.id}`, async () => {
        const response = await ofetch(card.link);
        const $ = load(response);
        const tags = $('meta[property="article:tag"]')
            ?.toArray()
            .map((tag) => $(tag).attr('content'));
        const date = $('meta[property="article:published_time"]').attr('content') || '';
        const updateDate = $('meta[property="article:modified_time"]').attr('content') || '';
        const summary = $('meta[property="description"]').attr('content') || '';
        const authorUrl = $('header.mega-header').find('div.author-row > a').attr('href');
        const authorAvatar = $('header.mega-header').find('header.mega-header div.author-row > a >img').attr('src');
        const authorName = $('header.mega-header').find('header.mega-header div.author-row > div > a.author-name').text();
        const content = $('div.article-content').html() || '';
        return {
            title: card.title,
            link: card.link,
            description: content,
            banner: card.thumbnail,
            image: card.thumbnail,
            pubDate: dateSort ? parseDate(date) : '',
            updated: dateSort ? parseDate(updateDate) : '',
            author: [
                {
                    name: authorName || '',
                    url: authorUrl || '',
                    avatar: authorAvatar || '',
                },
            ],
            content: {
                html: content,
                text: summary,
            },
            category: tags,
        } as DataItem;
    });
}
