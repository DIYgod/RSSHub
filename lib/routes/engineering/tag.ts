import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['programming'],
    example: '/engineering/tag/javascript',
    parameters: { tag: 'Browse programming languages, frameworks, and technologies' },
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
            source: ['engineering.fyi/tag/:tag'],
        },
    ],
    name: 'Tag',
    maintainers: ['suhang-only'],
    handler,
    description: `| JSON    | Javascript     | Java | Apache | AWS | SQL | React | Golang    |
| ---- | ---------- | ---- | ------ | --- | --- | ----- | ------ |
| json | javascript | java | apache | aws | sql | react | golang |`,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const { data: response } = await got(`https://engineering.fyi/tag/${tag}`);
    const $ = load(response);
    const items = $('div.text-card-foreground')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').eq(2);
            const description = item.find('.leading-relaxed');
            const author = item.find('.truncate');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: description.text(),
                author: author.text(),
            };
        });

    return {
        title: `engineering.fyi ${tag}`,
        link: `https://engineering.fyi/tag/${tag}`,
        item: items,
    };
}
