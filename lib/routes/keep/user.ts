import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media'],
    example: '/keep/user/556b02c1ab59390afea671ea',
    parameters: { id: 'Keep 用户 id' },
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
            source: ['gotokeep.com/users/:id'],
        },
    ],
    name: '运动日记',
    maintainers: ['Dectinc', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: `https://api.gotokeep.com/social/v3/people/${id}/home`,
        headers: {
            Referer: `https://show.gotokeep.com/users/${id}`,
        },
    });

    // check user have post or not
    if (response.data.data.entries.length === 0) {
        throw new Error('该用户运动日记为空');
    }

    response.data.data.entries[0] = response.data.data.entries[0].entries;
    const data = response.data.data.entries.reduce((all, current) => [...all, ...current.entries]);

    return {
        title: `${data[0].author.username} 的 Keep 动态`,
        link: `https://show.gotokeep.com/users/${id}`,
        language: 'zh-cn',
        item: data
            .filter((item) => 'title' in item.meta)
            .map((item) => {
                let images = [];
                if (item.images) {
                    images = item.meta.picture ? [...item.images, ...item.meta.picture] : item.images;
                } else if (item.meta.picture) {
                    images = [item.meta.picture];
                }
                let imagesTpl = '';
                for (const item of images) {
                    imagesTpl += `<img src="${item}">`;
                }

                const minute = Math.floor(item.meta.secondDuration / 60);
                const second = item.meta.secondDuration - minute * 60;
                return {
                    title: item.meta.title.trim(),
                    pubDate: item.created,
                    link: `https://show.gotokeep.com/entries/${item.id}`,
                    description: art(path.join(__dirname, 'templates/user.art'), {
                        item,
                        minute,
                        second,
                        imagesTpl,
                    }),
                };
            }),
    };
}
