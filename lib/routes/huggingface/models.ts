import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
});

function getPublicationDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export const route: Route = {
    path: '/models/:group',
    categories: ['programming'],
    example: '/huggingface/models/deepseek-ai',
    parameters: {
        group: 'The organization or user group name',
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
    maintainers: ['WuNein'],
    handler,
    url: 'huggingface.co',
};

async function handler(ctx) {
    const { group } = ctx.req.param();

    const url = `https://huggingface.co/${group}/models?sort=created`;

    const { body: response } = await got(url);
    const $ = load(response);

    const list: Array<DataItem & { link: string }> = $('article')
        .toArray()
        .map((article) => {
            const $article = $(article);
            const title = $article.find('a > div > header > h4').text();
            const href = $article.find('a[href]').first().attr('href');
            if (!href) {
                throw new Error('Hugging Face returned a model card without its repository URL.');
            }
            const link = new URL(href, url).href;
            const timeElement = $article.find('a > div > div > span.truncate > time');
            const datetime = timeElement.attr('datetime');

            return {
                title,
                link,
                pubDate: getPublicationDate(datetime),
            };
        })
        .filter((item) => item.title);

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`${item.link}:readme`, async () => {
                try {
                    const { body: detailResp } = await got(item.link + '/raw/main/README.md');

                    item.description = md.render(detailResp);
                    const $Out = load(item.description);
                    $Out('img').each((_, e) => {
                        const $e = $Out(e);

                        const src = $e.attr('src');
                        if (!src) {
                            return;
                        }

                        if (!/^https?:\/\//i.test(src)) {
                            $e.attr('src', new URL(src, `${item.link}/resolve/main/`).href);
                        }
                    });
                    item.description = $Out.html();
                    return { description: item.description };
                } catch (error) {
                    if (error instanceof FetchError && (error.statusCode === 403 || error.statusCode === 401)) {
                        // Example: https://huggingface.co/facebook/sam-3d-objects/raw/main/README.md
                        try {
                            const { body: respHtml } = await got(item.link + '/blob/main/README.md?code=true');
                            const $ = load(respHtml);
                            const detailHtml = $('body').find('div > main > div > section > div > div > div > div > div > table > tbody').text().trim();
                            item.description = md.render(detailHtml);
                            return { description: item.description };
                        } catch (error) {
                            if (error instanceof FetchError && [401, 403, 404].includes(error.statusCode!)) {
                                return { description: undefined };
                            }
                            throw error;
                        }
                    }
                    if (error instanceof FetchError && error.statusCode === 404) {
                        return { description: undefined };
                    }
                    throw error;
                }
            });
            return { ...item, description: detail.description };
        },
        { concurrency: 3 }
    );

    return {
        title: `Huggingface ${group} Models`,
        link: url,
        item: items,
    };
}
