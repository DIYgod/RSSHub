import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/rank',
    categories: ['shopping'],
    example: '/guangdiu/rank',
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
            source: ['guangdiu.com/rank.php'],
        },
    ],
    name: '一小时风云榜',
    maintainers: ['fatpandac'],
    handler,
    url: 'guangdiu.com/rank.php',
};

async function handler() {
    const url = `${host}/rank.php`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.hourrankitem')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('a.hourranktitle').text(),
            link: new URL($(item).find('a.hourranktitle').attr('href')!, host).href,
        }));

    const items = await Promise.all(
        list.map(async (item) => {
            const article = await cache.tryGet(`guangdiu:rank:article:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const description = $('#dabstract').html()! + $('a.dgotobutton').html('前往购买');
                const publishTime = copyElements($('.dinfoweibo').first()).children(':not(.latesttime)').remove().end().text().trim();
                const pubDate = publishTime ? parseRelativeDate(publishTime) : undefined;

                return { description, pubDate };
            });
            return { ...item, ...article };
        })
    );

    return {
        title: '逛丢 - 一小时风云榜',
        link: url,
        item: items,
    };
}
