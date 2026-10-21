import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cse',
    categories: ['university'],
    example: '/sysu/cse',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cse.sysu.edu.cn/'],
        },
    ],
    name: '计算机学院动态',
    maintainers: ['MegrezZhu', 'Neutrino3316', 'nczitzk'],
    handler,
    url: 'cse.sysu.edu.cn/',
};

const rootUrl = 'http://cse.sysu.edu.cn/';

function getItem($, element) {
    const item = $(element);
    const anchor = item.find('.title a, h3 a').first();
    const block = item.closest('.block');
    const tab = item.closest('.tab-pane');
    const category = tab.length ? copyNodes(block.find('.tab-nav a').eq(tab.index())).find('.icon').remove().end().text().trim() : block.find('h2').first().text();
    const date = item.find('.posttime time').first().attr('datetime')?.trim();
    const image = item.find('img').first().attr('src');
    // Event times describe the schedule, not the publication date.
    const eventContent = item.hasClass('eventsitem')
        ? item
              .find('.speaker, .location, .date')
              .toArray()
              .map((elem) => $.html(elem))
              .join('')
        : undefined;
    return {
        title: anchor.find('.text').length ? anchor.find('.text').text() : anchor.text(),
        link: new URL(anchor.attr('href'), rootUrl).href,
        pubDate: date ? parseDate(date) : undefined,
        category: category ? [category] : undefined,
        description: item.find('.summary').first().html() || eventContent || undefined,
        image: image ? new URL(image, rootUrl).href : undefined,
    };
}

async function handler(): Promise<Data> {
    const response = await got.get(rootUrl);
    const $ = load(response.data);
    const items = new Map();
    for (const element of $('.newspicitems, .newslistitems, .eventsitem, .newsinfo, .studentitem')) {
        const item = getItem($, element);
        if (!items.has(item.link)) {
            items.set(item.link, item);
        }
    }
    const title = $('title').text();
    return {
        title,
        link: rootUrl,
        description: title,
        language: 'zh-CN',
        item: items.values().toArray(),
    };
}

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
