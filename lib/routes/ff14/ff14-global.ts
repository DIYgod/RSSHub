import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: ['/global/:lang/:type?', '/ff14_global/:lang/:type?'],
    categories: ['game'],
    example: '/ff14/global/na/all',
    parameters: { lang: 'Region', type: 'Category, `all` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'FINAL FANTASY XIV (The Lodestone)',
    maintainers: ['chengyuhui'],
    handler,
    description: `Region

| North Ameria | Europe | France | Germany | Japan |
| ------------ | ------ | ------ | ------- | ----- |
| na           | eu     | fr     | de      | jp    |

  Category

| all | topics | notices | maintenance | updates | status | developers |
| --- | ------ | ------- | ----------- | ------- | ------ | ---------- |`,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const type = ctx.req.param('type') ?? 'all';

    if (!isValidHost(lang)) {
        throw new InvalidParameterError('Invalid lang');
    }

    const response = await got({
        method: 'get',
        url: `https://lodestonenews.com/news/${type}?locale=${lang}`,
    });

    let data;
    if (type === 'all') {
        data = [];
        for (const arr of Object.values(response.data)) {
            data = [...data, ...arr];
        }
    } else {
        data = response.data;
    }

    return {
        title: `FFXIV Lodestone updates (${type})`,
        link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
        item: data.map(({ id, url, title, time, description, image }) => ({
            title,
            link: url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image,
                description,
            }),
            pubDate: parseDate(time),
            guid: id,
        })),
    };
}
