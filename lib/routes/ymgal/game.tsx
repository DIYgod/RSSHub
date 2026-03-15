import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.ymgal.games';

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

export const route: Route = {
    path: '/game/release',
    categories: ['anime'],
    example: '/ymgal/game/release',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['ymgal.games/'],
        },
    ],
    name: '本月新作',
    maintainers: ['SunBK201'],
    handler,
    url: 'ymgal.games/',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${host}/release-list/${year}/${month}`,
    });

    const $ = load(response.data);
    const list = $('.game-view-card').toArray();

    const items =
        list &&
        list.map((item) => {
            item = $(item);
            const itemPicUrl = item.find('.lazy').first().attr('data-original');
            const tags = item.find('.tag-info-list').children();
            const taginfo = tags.toArray().map((elem) => $(elem).text());
            return {
                title: item.attr('title'),
                link: `${host}${item.attr('href')}`,
                description: renderDescription(itemPicUrl, taginfo),
            };
        });

    return {
        title: `月幕 Galgame - 本月新作`,
        link: `${host}/release-list/${year}/${month}`,
        description: '月幕 Galgame - 本月新作',
        item: items,
    };
}

const renderDescription = (itemPicUrl: string | undefined, taginfo: string[]): string =>
    renderToString(
        <>
            {itemPicUrl ? <img src={itemPicUrl} /> : null}
            <br />
            {taginfo.map((tag, index) => (
                <li key={`${tag}-${index}`}>{tag}</li>
            ))}
        </>
    );
