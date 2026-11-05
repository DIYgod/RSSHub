import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.ymgal.games';

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
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const response = await got({
        method: 'get',
        url: `${host}/release-list/${year}/${month}`,
    });

    const $ = load(response.data);
    const list = $('.game-view-card').toArray();

    const items =
        list &&
        list.map((item) => {
            const $item = $(item);
            const itemPicUrl = $item.find('.lazy').first().attr('data-original');
            const tags = $item.find('.tag-info-list').children();
            const tagInfo = tags.toArray().map((elem) => ({ text: $(elem).text(), date: getReleaseDate($(elem).text()) }));
            return {
                title: $item.attr('title')!,
                link: `${host}${$item.attr('href')}`,
                description: renderDescription(itemPicUrl),
                category: tagInfo.filter((tag) => !tag.date && tag.text.trim()).map((tag) => tag.text),
                pubDate: tagInfo.find((tag) => tag.date)?.date,
            };
        });

    return {
        title: '月幕 Galgame - 本月新作',
        link: `${host}/release-list/${year}/${month}`,
        description: '月幕 Galgame - 本月新作',
        item: items,
    };
}

const renderDescription = (itemPicUrl: string | undefined): string =>
    renderToString(
        <>
            {itemPicUrl ? <img src={itemPicUrl} /> : null}
            <br />
        </>
    );

function getReleaseDate(value: string): Date | undefined {
    const date = value.match(/^(\d{4}-\d{2}-\d{2})发行$/)?.[1];
    if (!date || !Number.isFinite(parseDate(date, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    // The source provides a calendar day; midnight only serializes that day.
    return parseDate(`${date}T00:00:00Z`);
}
