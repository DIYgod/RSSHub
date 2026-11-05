import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import utils from './utils';

async function fetchDetail(link: string): Promise<Pick<DataItem, 'description'>> {
    const response = await got(link);
    const $ = load(response.data);
    const description = $('.newscontent');
    description.find('.detitemtit, .detposttiau').remove();
    return { description: description.html() ?? '' };
}

export const route: Route = {
    path: '/news/:tag?',
    categories: ['study'],
    example: '/x-mol/news/3',
    parameters: { tag: 'Tag number, can be obtained from news list URL. Empty value means news index.' },
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
            source: ['x-mol.com/news/index'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['cssxsh'],
    handler,
    url: 'x-mol.com/news/index',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const urlPath = tag ? `news/tag/${tag}` : 'news/index';
    const link = new URL(urlPath, utils.host).href;
    const response = await got(link);
    const data = response.data;
    const $ = load(data);
    if (!$('.newsitem').length && $('#loginForm input[type="password"]').length) {
        throw new NotFoundError('The X-MOL news page requires login; anonymous news content is unavailable');
    }

    const newsitem = $('.newsitem')
        .toArray()
        .filter((element) => $(element).find('h3 a').attr('href'))
        .map((element) => {
            const $element = $(element);
            const a = $element.find('h3 a');
            const span = $element.find('.space-right-m30');
            const author = span.text().replace('来源：', '').trim();
            const rawDate = span.next().text().trim();
            const pubDate = rawDate ? timezone(parseDate(rawDate, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], true), 8) : undefined;

            return {
                title: a.text(),
                link: new URL(a.attr('href')!, utils.host).href,
                description: renderToString(
                    <>
                        {$element.find('img').attr('src') ? (
                            <>
                                <img src={$element.find('img').attr('src')!.split('?', 1)[0]} />
                                <br />
                            </>
                        ) : null}
                        {$element.find('.thsis-div a').text().trim() ? <p>{$element.find('.thsis-div a').text().trim()}</p> : null}
                    </>
                ),
                author,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    const item = await pMap(
        newsitem,
        async (item) => {
            if (item.link.includes('outLinkByIdAndCode')) {
                return item;
            }
            const detail = await cache.tryGet(`xmol:news:detail:v1:${item.link}`, () => fetchDetail(item.link));
            return { ...item, description: detail.description };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content'),
        item,
    };
}
