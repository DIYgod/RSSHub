import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/nice',
    categories: ['blog'],
    example: '/chuanliu/nice',
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
            source: ['chuanliu.org/nice'],
        },
    ],
    name: '严选',
    maintainers: ['nczitzk'],
    handler,
    url: 'chuanliu.org/nice',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://chuanliu.org';
    const apiRootUrl = 'https://s.chuanliu.org';
    const currentUrl = new URL('nice/', rootUrl).href;
    const apiUrl = new URL('api/dis/api/v1/memo', apiRootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            creatorId: 1,
            offset: 0,
            limit,
        },
    });

    const items = response.slice(0, limit).map((item) => {
        const contents = item.content.split(/\n/);

        const category = contents?.[0].replace(/^#/, '') ?? undefined;
        const title = contents?.[1] ?? undefined;
        const link = contents?.[2] ?? undefined;
        const author = contents?.[3] ?? undefined;
        const isStar = (contents?.[5] && contents[5] === 'star') ?? false;

        if (isStar) {
            contents.splice(5, 1);
        }

        return {
            title: `${isStar ? '[STAR] ' : ''}${title}`,
            link,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: md.render(contents?.join('\n\n') ?? ''),
                images: item.resourceList.map((i) => ({
                    src: i.externalLink,
                    alt: i.filename,
                    type: i.type,
                })),
            }),
            author,
            category: [category, isStar ? 'STAR' : undefined].filter(Boolean),
            guid: `chuanliu-nice#${item.id}`,
            pubDate: parseDate(item.createdTs, 'X'),
            updated: parseDate(item.updatedTs, 'X'),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), currentUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('span.rainbow-text').first().text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('title').text(),
        author: $('meta[name="author"]').prop('content'),
        allowEmpty: true,
    };
}
