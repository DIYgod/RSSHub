import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { parseArticle } from './utils';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/web/:channel',
    categories: ['traditional-media'],
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
    description: `-   若在桌面端打开奥一网栏目页（如 \`https://www.oeeee.com/api/channel.php?s=/index/index/channel/gz\`），可查看该页源代码，搜索 \`OECID\`。
  -   若在移动端打开奥一网栏目页（格式例：\`https://m.oeeee.com/m.php?s=/m2/channel&channel_id=169\`），即可从 url 中获取。需注意的是，如果该栏目页的 url 格式为 \`https://m.oeeee.com/detailChannel_indexData.html?channel_id=266\` ，则 \`266\` 并非为本路由可用的频道 ID，建议从桌面端获取。`,
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
