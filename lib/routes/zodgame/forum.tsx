import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://zodgame.xyz';

export const route: Route = {
    path: '/forum/:fid?',
    categories: ['bbs'],
    example: '/zodgame/forum/13',
    parameters: { fid: 'forum id, can be found in URL' },
    features: {
        requireConfig: [
            {
                name: 'ZODGAME_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'forum',
    maintainers: ['FeCCC'],
    handler,
};

async function handler(ctx) {
    const fid = ctx.req.param('fid');
    const subUrl = `${rootUrl}/api/mobile/index.php?version=4&module=forumdisplay&fid=${fid}`;
    const cookie = config.zodgame.cookie;

    if (cookie === undefined) {
        throw new ConfigNotFoundError('Zodgame RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const response = await got({
        method: 'get',
        url: subUrl,
        headers: {
            Cookie: cookie,
        },
    });

    const info = response.data.Variables;

    const threadList: Array<DataItem & { tid: string }> = info.forum_threadlist
        .map((item) => {
            const type = info.threadtypes?.types?.[item.typeid];
            return {
                tid: item.tid,
                title: type ? `[${type}] ${item.subject}` : item.subject,
                author: item.author,
                link: `${rootUrl}/forum.php?mod=viewthread&tid=${item.tid}&extra=page%3D1`,
                category: type,
                pubDate: parseDate(item.dbdateline * 1000),
            };
        })
        .filter((item) => item !== undefined);

    // fulltext
    const items = await pMap(
        threadList,
        async (item) => {
            const details = await cache.tryGet(`zodgame:details:${md5(cookie)}:${item.tid}`, async () => {
                const threadResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/mobile/index.php?version=4&module=viewthread&tid=${item.tid}`,
                    headers: {
                        Cookie: cookie,
                    },
                });

                const threadInfo = threadResponse.data.Variables;

                const description = [threadInfo.thread.freemessage, threadInfo.postlist[0].message].filter(Boolean).join('<br /><br />');

                return {
                    description,
                    upvotes: Number(threadInfo.thread.recommend_add),
                    downvotes: Number(threadInfo.thread.recommend_sub),
                    comments: Number(threadInfo.thread.replies),
                };
            });
            const { tid, ...currentItem } = item;
            return { ...currentItem, ...details, guid: tid };
        },
        { concurrency: 3 }
    );

    return {
        title: `${info.forum.name} - ZodGame论坛`,
        link: `${rootUrl}/forum.php?mod=forumdisplay&fid=${fid}`,
        item: items,
    };
}
