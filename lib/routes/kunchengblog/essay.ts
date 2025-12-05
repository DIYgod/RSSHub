import { load } from 'cheerio';
import { SourceMapConsumer } from 'source-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/essay',
    categories: ['blog'],
    example: '/kunchengblog/essay',
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
            source: ['kunchengblog.com/essay'],
        },
    ],
    name: 'Essay',
    maintainers: ['nczitzk'],
    handler,
    url: 'kunchengblog.com/essay',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://www.kunchengblog.com';
    const currentUrl = new URL('essay', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();

    const mapUrl = new URL(`${$('script').first().prop('src')}.map`, rootUrl).href;

    const { data: response } = await got(mapUrl);

    const items = await SourceMapConsumer.with(response, null, (consumer) =>
        consumer.sources
            .filter((s) => /routes\/essays/.test(s))
            .toReversed()
            .slice(0, limit)
            .map((item) => {
                const source = consumer.sourceContentFor(item).replaceAll(/\s\n/g, '');

                const processedSource = source.replaceAll(/(\w+)={+([^{}]+)}+/g, (match, key, value) => {
                    const processedValue = value.slice(1, -1).replaceAll('"', "'").trim();
                    return `${key}="${processedValue}"`;
                });

                const content = load(processedSource);

                return {
                    title: content('title').text(),
                    pubDate: parseDate(content('p[className="App-essay-article"]').last().find('b').first().text(), 'MMM YYYY'),
                    link: new URL(`essay/${item.match(/\/(\w+)\.js/)[1].toLowerCase()}`, currentUrl).href,
                    description: content('p[className="App-essay-article"]')
                        .toArray()
                        .map((p) => content(p).html())
                        .join(''),
                    author: title,
                };
            })
    );

    const description = $('meta[name="description"]').prop('content');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${title} - Essay`,
        link: currentUrl,
        description,
        language: $('html').prop('lang'),
        image: icon,
        icon,
        logo: icon,
        subtitle: description,
        author: title,
        allowEmpty: true,
    };
}
