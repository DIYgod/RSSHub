import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        .flatMap((item) => {
            const $item = $(item);
            const href = $item.find('.header').attr('href');
            if (!href) {
                return [];
            }
            const date = $item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: $item.find('.header').text(),
                description: $item.find('.description').html(),
                link: new URL(href, topicUrl).href,
                author: $item.find('.extra > .list > .item:nth-of-type(1)').text(),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), 8),
            };
        });

    const resultItem = await pMap(
        list,
        async (item) => {
            try {
                const description = await cache.tryGet(`oschina:topic:body:${item.link}`, async () => {
                    const content = await loadContent(item.link);
                    content('.ad-wrap').remove();
                    const description = content('#articleContent').html();
                    if (!description) {
                        throw new Error('The question page does not contain article content');
                    }
                    return description;
                });
                return { ...item, description };
            } catch (error) {
                if (error instanceof FetchError && error.response?.status === 403) {
                    return item;
                }
                throw error;
            }
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
