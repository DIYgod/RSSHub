import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/entry/:id',
    categories: ['anime'],
    example: '/cngal/entry/2693',
    parameters: { id: '词条ID，游戏或制作者页面URL的最后一串数字' },
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
            source: ['www.cngal.org/entries/index/:id'],
        },
    ],
    name: '制作者 / 游戏新闻',
    maintainers: ['chengyuhui'],
    handler,
};

async function handler(ctx) {
    const entryId = ctx.req.param('id');

    const response = await got(`https://www.cngal.org/api/entries/GetEntryView/${entryId}`);

    const data = response.data;

    ctx.set('json', response.data);
    return {
        title: `CnGal - ${data.name} 的动态`,
        link: `https://www.cngal.org/entries/index/${entryId}`,
        item: data.newsOfEntry.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/entry-description.art'), item),
            pubDate: timezone(parseDate(item.happenedTime), +8),
            link: item.link,
        })),
    };
}
