import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

const baseUrl = 'https://www.playstation.com/en-sg/ps-plus/whats-new/';

export const route: Route = {
    path: '/monthly-games',
    categories: ['game'],
    view: ViewType.Notifications,
    example: '/ps/monthly-games',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.playstation.com/en-sg/ps-plus/whats-new'],
            target: '/monthly-games',
        },
    ],
    name: 'PlayStation Monthly Games',
    maintainers: ['justjustCC'],
    handler,
    url: 'www.playstation.com/en-sg/ps-plus/whats-new',
};

const normalizeText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

const getSrcsetUrl = (srcset?: string) => srcset?.split(',')[0]?.trim().split(/\s+/)[0];

const getAbsoluteUrl = (url?: string) => (url ? new URL(url, baseUrl).href : undefined);

const renderDescription = (img?: string, text?: string) =>
    renderToString(
        <>
            {img ? <img src={img} /> : null}
            {text}
        </>
    );

async function handler() {
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const cards = $('.cmp-experiencefragment--wn-latest-monthly-games-content .box').toArray();
    const fallbackCards = $('#monthly-games .box--light').toArray();
    const monthlyGameCards = cards.length > 0 ? cards : fallbackCards;

    const list = monthlyGameCards
        .map((e) => {
            const item = $(e);
            const img = item.find('.media-block--image').first().attr('data-src') ?? getSrcsetUrl(item.find('.media-block__img source').first().attr('srcset')) ?? item.find('.media-block__img img').first().attr('src');
            const title = item.find('h3').first().text();
            const text = normalizeText(item.find('.txt-block__paragraph p, .body-text-block p, h3 + p').first().text());
            const link = getAbsoluteUrl(item.find('a[href]').first().attr('href'));

            return {
                title,
                description: renderDescription(img, text),
                link,
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: 'PlayStation Plus Monthly Games',
        link: baseUrl,
        item: list,
    };
}
