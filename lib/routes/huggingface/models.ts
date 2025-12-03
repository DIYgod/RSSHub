import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/models/:group/:cycle?',
    categories: ['programming'],
    example: '/huggingface/models/deepseek-ai/week',
    parameters: {
        group: 'The organization or user group name',
        cycle: 'The time cycle for filtering. Choose from: date, week, month. Default: week',
    },
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
            source: ['huggingface.co/:group/models'],
            target: '/models/:group',
        },
    ],
    name: 'Group Models',
    maintainers: [],
    handler,
    url: 'huggingface.co',
};

async function handler(ctx) {
    const { group, cycle = 'date' } = ctx.req.param();

    // Validate cycle parameter
    if (!['date', 'week', 'month'].includes(cycle)) {
        throw new Error(`Invalid cycle: ${cycle}`);
    }

    const url = `https://huggingface.co/${group}/models?sort=created`;

    const { body: response } = await got(url);
    const $ = load(response);

    const now = new Date();
    let filterDate: Date;

    switch (cycle) {
        case 'date':
            filterDate = new Date(now);
            filterDate.setDate(filterDate.getDate() - 1);
            break;
        case 'week':
            filterDate = new Date(now);
            filterDate.setDate(filterDate.getDate() - 7);
            break;
        case 'month':
            filterDate = new Date(now);
            filterDate.setMonth(filterDate.getMonth() - 1);
            break;
        default:
            filterDate = new Date(now);
            filterDate.setDate(filterDate.getDate() - 1);
    }

    const items = $('article')
        .toArray()
        .map((article) => {
            const $article = $(article);
            const title = $article.find('a > div > header > h4').text().trim();
            const link = `https://huggingface.co/${title}`;
            const timeElement = $article.find('a > div > div > span.truncate > time');
            const datetime = timeElement.attr('datetime');
            const description = $article.text().replaceAll(/\s+/g, ' ').trim();

            return {
                title,
                link,
                description,
                pubDate: datetime ? parseDate(datetime) : undefined,
                datetime,
            };
        })
        .filter((item) => {
            if (!item.title || !item.datetime) {
                return false;
            }
            const itemDate = new Date(item.datetime);
            return itemDate >= filterDate;
        })
        .map(({ datetime: _datetime, ...item }) => item);

    return {
        title: `Huggingface ${group} Models - ${cycle}`,
        link: url,
        item: items,
    };
}