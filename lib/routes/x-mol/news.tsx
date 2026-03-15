import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import utils from './utils';

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

    const newsitem = $('.newsitem')
        .toArray()
        .map((element) => {
            element = $(element);
            const a = element.find('h3 a');
            const span = element.find('.space-right-m30');
            const author = span.text().replace('来源：', '').trim();

            return {
                title: a.text(),
                link: new URL(a.attr('href'), utils.host).href,
                description: renderToString(
                    <>
                        {element.find('img').attr('src') ? (
                            <>
                                <img src={element.find('img').attr('src').split('?')[0]} />
                                <br />
                            </>
                        ) : null}
                        {element.find('.thsis-div a').text().trim() ? <p>{element.find('.thsis-div a').text().trim()}</p> : null}
                    </>
                ),
                author,
                pubDate: span.next().length ? timezone(parseDate(span.next().text().trim()), 8) : undefined,
            };
        });

    const item = await Promise.all(
        newsitem.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('outLinkByIdAndCode')) {
                    return item;
                }

                const response = await got(item.link);
                const $ = load(response.data);

                const description = $('.newscontent');
                description.find('.detitemtit, .detposttiau').remove();

                item.description = description.html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: response.url,
        description: $('meta[name="description"]').attr('content'),
        item,
    };
}
