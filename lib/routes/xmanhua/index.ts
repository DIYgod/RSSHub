import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:uid',
    categories: ['anime'],
    example: '/xmanhua/73xm',
    parameters: { uid: '漫画 id,在浏览器中可见，例如鬼灭之刃对应的 id 为 `73xm`' },
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
            source: ['xmanhua.com/:uid'],
        },
    ],
    name: '最新动态',
    maintainers: ['Ye11'],
    handler,
};

function parseChapterDate(value?: string) {
    const dateText = value?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!dateText) {
        return;
    }
    const date = parseDate(dateText, 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const host = 'https://xmanhua.com';
    const url = `https://xmanhua.com/${uid}/`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('div #chapterlistload').find('.detail-list-form-item');
    // The comic page supplies one author for its chapter entries.
    const authorName = $('body > div.detail-info-1 > div > div > p.detail-info-tip > span:nth-child(1)').text().split('：', 2)[1] || undefined;
    const categories = [
        ...new Set(
            $('.detail-info-tip .item')
                .toArray()
                .map((item) => $(item).text())
                .filter(Boolean)
        ),
    ];
    const finishedText = $('div.detail-list-form-title')
        .contents()
        .filter((_, node) => node.type === 'text')
        .text();
    let finished = false;
    const updatedDate = parseChapterDate(finishedText.split(',', 2)[1]);
    if (finishedText.includes('已完結') || finishedText.includes('已完结')) {
        finished = true;
    }
    // The comic page supplies the latest chapter link.
    const updatedOne = $('div.detail-list-form-title span.s a').attr('href');
    const items = list.toArray().map((item) => {
        const $item = $(item);
        const itemTitle = $item.text();
        const itemUrl = $item.attr('href');
        const itemDate = itemUrl === updatedOne ? updatedDate : undefined;
        return {
            title: itemTitle,
            link: host + itemUrl,
            author: authorName,
            category: categories.length ? categories : undefined,
            pubDate: itemDate,
            guid: host + itemUrl,
        };
    });
    const name = $('body > div.detail-info-1 > div > div > p.detail-info-title').text();
    const description = finished ? '已完结' : '连载中';
    return {
        title: `x漫画  ${name}`,
        link: `https://xmanhua.com/${uid}`,
        description,
        item: items,
    };
}
