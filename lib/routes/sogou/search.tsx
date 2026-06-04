import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const renderDescription = (description, images) =>
    renderToString(
        <>
            {description ? raw(description) : null}
            {images?.map((src) => (
                <img src={src} />
            ))}
        </>
    );

export const route: Route = {
    path: '/search/:keyword',
    categories: ['other'],
    example: '/sogou/search/rss',
    parameters: { keyword: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `https://www.sogou.com/web?query=${encodeURIComponent(keyword)}`;
    const key = `sogou-search:${url}`;
    const items = await cache.tryGet(
        key,
        async () => {
            const response = (await got(url)).data;
            const $ = load(response);
            const result = $('#main');
            return result
                .find('.vrwrap')
                .toArray()
                .map((el) => {
                    const element = $(el);
                    const imgs = element
                        .find('img')
                        .toArray()
                        .map((el2) => $(el2).attr('src'));
                    const link = element.find('h3 a').first().attr('href');
                    const title = element.find('h3').first().text();
                    const description = element.find('.text-layout').first().text() || element.find('.space-txt').first().text() || element.find('[class^="translate"]').first().text();
                    const author = element.find('.citeurl span').first().text() || '';
                    const pubDate = parseDate(element.find('.citeurl .cite-date').first().text().trim());
                    return {
                        link,
                        title,
                        description: renderDescription(description, imgs),
                        author,
                        pubDate,
                    };
                })
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${keyword} - 搜狗搜索`,
        description: `${keyword} - 搜狗搜索`,
        link: url,
        item: items,
    };
}
