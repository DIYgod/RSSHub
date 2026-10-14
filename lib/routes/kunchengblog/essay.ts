import { load } from 'cheerio';
import { SourceMapConsumer } from 'source-map';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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

const convertAttributes = (source: string, files: Record<string, string>, rootUrl: string) => {
    const assets = new Map(
        source
            .matchAll(/^import\s+(\w+)\s+from\s+["']([^"']+)["']/gm)
            .toArray()
            .map(([, name, path]) => {
                const asset = files[`static/media/${path.split('/').at(-1)}`];
                return [name, asset ? new URL(asset, rootUrl).href : undefined];
            })
    );
    return source.replaceAll(/\{\/\*[\s\S]*?\*\/\}/g, '').replaceAll(/(\w+)=\{+([^{}]+)\}+/g, (match, key, value) => {
        const expression = value.trim();
        const literal = expression.match(/^(["'])([\s\S]*)\1$/);
        const processedValue = assets.get(expression) ?? literal?.[2] ?? expression;
        return `${key}="${processedValue.replaceAll('"', '&quot;')}"`;
    });
};

const parsePublicationMonth = (value: string) => {
    const match = value.trim().match(/^([A-Z]+)\s+(\d{4})\b/i);
    if (!match) {
        return;
    }
    const date = parseDate(`${match[1]} 1, ${match[2]} GMT`);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 100);
    const sourceLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(100, limit);

    const rootUrl = 'https://www.kunchengblog.com';
    const currentUrl = new URL('essay', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();

    const scriptUrl = $('script[src]')
        .toArray()
        .map((script) => new URL($(script).attr('src')!, currentUrl))
        .find((url) => url.pathname.startsWith('/static/js/main.') && url.pathname.endsWith('.js'));
    if (!scriptUrl) {
        throw new Error(`Cannot find the application script on ${currentUrl}.`);
    }
    const mapUrl = new URL(scriptUrl.href);
    mapUrl.pathname += '.map';

    const { data: response } = await got(mapUrl.href);

    const files = await cache.tryGet(`kunchengblog:assets:${scriptUrl.pathname}`, async () => {
        const { data } = await got(new URL('asset-manifest.json', rootUrl).href);
        return data.files as Record<string, string>;
    });

    const items = await SourceMapConsumer.with(response, null, (consumer) =>
        consumer.sources
            .filter((s) => /routes\/essays/.test(s))
            .toReversed()
            .slice(0, sourceLimit)
            .map((item) => {
                const source = consumer.sourceContentFor(item)!.replaceAll(/\s\n/g, '');

                const processedSource = convertAttributes(source, files, rootUrl);

                const content = load(processedSource, { xmlMode: true });
                const publication = content('p[className="App-essay-article"]').last();
                const publicationText = publication.text();
                const pubDate = parsePublicationMonth(publicationText);
                const sourceAuthor = publicationText.match(/^\s*[A-Za-z]+\s+\d{4}[ \t]*\|[ \t]*Author:[ \t]*([^\r\n]+)/)?.[1];
                if (pubDate) {
                    const header = publication
                        .contents()
                        .toArray()
                        .find((node) => content(node).text().trim());
                    if (header?.type === 'text') {
                        header.data = header.data.replace(/^\s*[A-Za-z]+\s+\d{4}(?:[ \t]*\|[ \t]*Author:[^\r\n]*)?[ \t]*(?:\r?\n)?/, '');
                    } else if (header && /^[A-Za-z]+\s+\d{4}(?:\s*\|\s*Author:.*)?$/.test(content(header).text().trim())) {
                        content(header).remove();
                    }
                }

                return {
                    title: content('title').text(),
                    pubDate,
                    link: new URL(`essay/${item.match(/\/(\w+)\.js/)![1].toLowerCase()}`, currentUrl).href,
                    description: content('p[className="App-essay-article"]')
                        .toArray()
                        .map((p) => content.html(content(p).contents(), { xmlMode: false }))
                        .join(''),
                    author: sourceAuthor ?? title,
                };
            })
    );

    const language = $('html').prop('lang') as Language;

    const description = $('meta[name="description"]').prop('content');
    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    return {
        item: items,
        title: `${title} - Essay`,
        link: currentUrl,
        description,
        language,
        image: icon,
        icon,
        logo: icon,
        subtitle: description,
        author: title,
    };
}
