import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.gz.gov.cn';

const urlMap = {
    gzyw: 'gzyw',
    jrtt: 'jrtt',
    tzgg: 'tzgg',
    zcjd: 'zcjd/zcjd',
};

export async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? ctx.req.path.split('/', 4)[3];
    const category = ctx.req.param('category');
    if (!Object.hasOwn(urlMap, category) || (channel === 'xw' ? category === 'zcjd' : channel !== 'zwgk' || category !== 'zcjd')) {
        throw new InvalidParameterError('Invalid category. Use gzyw, jrtt or tzgg for news, or zcjd for policy interpretations.');
    }
    const url = `${rootUrl}/${channel}/${urlMap[category]}/`;
    const response = await got(url);
    const $ = load(response.data);

    const items = $('.news_list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.find('a').attr('href');
            const dateText = $item.find('span').text();
            const date = dateText ? parseDate(dateText) : undefined;
            return {
                title: $item.find('a').attr('title')!,
                link: href,
                pubDate: date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined,
            };
        });

    return {
        title: `广州市人民政府 - ${$('.main_title').text()}`,
        link: url,
        item: await pMap(
            items,
            async (item) => {
                const detail = await cache.tryGet(`${item.link}:article`, async () => {
                    const { data } = await got(item.link!);
                    const content = load(data);
                    const dateText = content('meta[name="PubDate"]').attr('content');
                    const date = dateText ? parseDate(dateText) : undefined;
                    return {
                        description: content('#zoomcon').html() ?? undefined,
                        author: content('meta[name="ContentSource"]').attr('content') || undefined,
                        pubDate: date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined,
                    };
                });
                return { ...item, description: detail.description, pubDate: detail.pubDate ?? item.pubDate, author: detail.author };
            },
            { concurrency: 3 }
        ),
    };
}
