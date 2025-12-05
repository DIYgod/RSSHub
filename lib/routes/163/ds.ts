import path from 'node:path';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const root_url = 'https://inf.ds.163.com';

export const route: Route = {
    path: '/ds/:id',
    categories: ['game'],
    example: '/163/ds/63dfbaf4117741daaf73404601165843',
    parameters: { id: '用户ID' },
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
            source: ['ds.163.com/user/:id'],
        },
    ],
    name: '用户发帖',
    maintainers: ['luyuhuang'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const current_url = `${root_url}/v1/web/feed/basic/getSomeOneFeeds?feedTypes=1,2,3,4,6,7,10,11&someOneUid=${id}`;
    const response = await got({
        method: 'get',
        url: current_url,
    });
    const data = response.data.result.feeds;

    const list = data.map((feed) => ({
        title: JSON.parse(feed.content).body.text,
        link: `https://ds.163.com/feed/${feed.id}`,
        description: art(path.resolve(__dirname, 'templates/ds.art'), {
            text: JSON.parse(feed.content).body.text,
            medias: JSON.parse(feed.content).body.media,
        }),
        pubDate: parseDate(feed.updateTime),
    }));

    return {
        title: `${response.data.result.userInfos[0].user.nick} 的动态`,
        link: `https://ds.163.com/user/${id}`,
        item: list,
    };
}
