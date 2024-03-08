import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { parseArticle } from './utils';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/web/:channel',
    categories: ['bbs'],
    example: '/oeeee/web/170',
    parameters: { channel: '频道 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '奥一网',
    maintainers: ['TimWu007'],
    handler,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? 0;
    const currentUrl = `https://www.oeeee.com/api/channel.php?m=Js4channelNews&a=newLatest&cid=${channel}`;

    const { data: response } = await got(currentUrl);

    const list = response.data.map((item) => ({
        title: '【' + item.channel_name + '】' + item.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
            thumb: item.img,
            description: item.summary,
        }),
        pubDate: timezone(parseDate(item.datetime), +8),
        link: item.linkurl,
        author: item.author,
        // channelName: item.channel_name,
        channelEname: item.channel_ename,
    }));

    const channelEname = list[1] ? list[1].channelEname : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `南方都市报奥一网`,
        link: `https://www.oeeee.com/api/channel.php?s=/index/index/channel/${channelEname}`,
        item: items,
    };
}
