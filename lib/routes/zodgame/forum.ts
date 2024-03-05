import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://zodgame.xyz';

export default async (ctx) => {
    const fid = ctx.req.param('fid');
    const subUrl = `${rootUrl}/api/mobile/index.php?version=4&module=forumdisplay&fid=${fid}`;
    const cookie = config.zodgame.cookie;

    if (cookie === undefined) {
        throw new Error('Zodgame RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const response = await got({
        method: 'get',
        url: subUrl,
        headers: {
            Cookie: cookie,
        },
    });

    const info = response.data.Variables;

    const ThreadList = info.forum_threadlist
        .map((item) => {
            if (!info.threadtypes.types[item.typeid]) {
                return;
            }
            const type = info.threadtypes.types[item.typeid];

            return {
                tid: item.tid,
                title: `[${type}] ${item.subject}`,
                author: item.author,
                link: `${rootUrl}/forum.php?mod=viewthread&tid=${item.tid}&extra=page%3D1`,
                category: type,
                pubDate: parseDate(item.dbdateline * 1000),
            };
        })
        .filter((item) => item !== undefined);

    // fulltext
    const items = await Promise.all(
        ThreadList.map((item) =>
            cache.tryGet(item.tid, async () => {
                const threadResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/mobile/index.php?version=4&module=viewthread&tid=${item.tid}`,
                    headers: {
                        Cookie: cookie,
                    },
                });

                const threadInfo = threadResponse.data.Variables;

                let description = '';

                if (threadInfo.thread.freemessage) {
                    description += threadInfo.thread.freemessage;
                    description += art(path.join(__dirname, 'templates/forum.art'), {
                        content: threadInfo.postlist[0].message,
                    });
                } else {
                    description += threadInfo.postlist[0].message;
                }

                return {
                    title: item.title,
                    author: item.author,
                    link: item.link,
                    description,
                    category: item.category,
                    pubDate: item.pubDate,
                    guid: item.tid,
                    upvotes: Number.parseInt(threadInfo.thread.recommend_add, 10),
                    downvotes: Number.parseInt(threadInfo.thread.recommend_sub, 10),
                    comments: Number.parseInt(threadInfo.thread.replies, 10),
                };
            })
        )
    );

    ctx.set('data', {
        title: `${info.forum.name} - ZodGame论坛`,
        link: `${rootUrl}/forum.php?mod=forumdisplay&fid=${fid}`,
        item: items,
    });
};
