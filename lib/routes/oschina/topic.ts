import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/time';

async function loadContent(link) {
    const res = await got(link);
    const content = load(res.data);
    return content;
}

export const route: Route = {
    path: '/topic/:topic',
    categories: ['programming'],
    example: '/oschina/topic/weekly-news',
    parameters: { topic: '主题名，可从 [全部主题](https://www.oschina.net/question/topics) 进入主题页，在 URL 中找到' },
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
            source: ['oschina.net/question/topic/:topic'],
        },
    ],
    name: '问答主题',
    maintainers: ['loveely7'],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic');
    const topicUrl = `https://www.oschina.net/question/topic/${topic}?show=time`;

    const $ = await loadContent(topicUrl);
    const topicName = $('.topic-info > .topic-header > h3').text();
    const list: Array<DataItem & { link: string }> = $('#questionList .question-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const date = $item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: $item.find('.header').text(),
                description: $item.find('.description').html(),
                link: new URL($item.find('.header').attr('href')!, topicUrl).href,
                author: $item.find('.extra > .list > .item:nth-of-type(1)').text(),
                pubDate: /\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm'], 8) : parseRelativeDate(date, 8),
            };
        });

    const resultItem = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`oschina:topic:body:${item.link}`, async () => {
                const content = await loadContent(item.link);
                content('.ad-wrap').remove();
                return content('#articleContent').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: `开源中国-${topicName}`,
        description: $('.topic-introduction').text(),
        link: topicUrl,
        item: resultItem,
    };
}
