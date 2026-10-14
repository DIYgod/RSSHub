import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const X_UA = 'NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)';

export const route: Route = {
    path: '/forum/:fid/:recommend?',
    categories: ['bbs'],
    view: ViewType.Articles,
    example: '/nga/forum/489',
    parameters: { fid: '分区 id, 可在分区主页 URL 找到, 没有 fid 时 stid 同样适用', recommend: '是否只显示精华主题, 留空为否, 任意值为是' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分区帖子',
    maintainers: ['xyqfer'],
    handler,
};

type Thread = { tid: number; subject: string; postdate: number };

class LoginRequiredError extends Error {}

async function handler(ctx) {
    const { fid, recommend } = ctx.req.param();
    const timestamp = Math.floor(Date.now() / 1000);
    let cookieString = `guestJs=${timestamp};`;
    if (config.nga.uid && config.nga.cid) {
        cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
    }
    const formatContent = (content) =>
        content
            .replaceAll(/\[img\](.+?)\[\/img\]/g, (match, p1) => {
                const src = p1.replaceAll(/\?.*/g, '');
                return `<img src="${src}" />`;
            })
            .replaceAll(/\[url\](.+?)\[\/url\]/g, '<a href="$1">$1</a>');
    const homePage: { data: { forumname: string; result: { data: Thread[] } } } = await got.post('https://ngabbs.com/app_api.php?__lib=subject&__act=list', {
        headers: {
            'X-User-Agent': X_UA,
            Cookie: cookieString,
        },
        form: {
            fid,
            recommend: recommend ? 1 : 0,
        },
    });

    const forumname = homePage.data.forumname;

    const seen = new Set<number>();
    const list = homePage.data.result.data.filter(({ tid }) => {
        if (!tid || seen.has(tid)) {
            return false;
        }
        seen.add(tid);
        return true;
    });

    const resultItem = await pMap(
        list,
        async ({ subject, postdate, tid }) => {
            const link = `https://nga.178.com/read.php?tid=${tid}`;
            const item: DataItem = {
                title: subject,
                link,
                pubDate: parseDate(postdate, 'X'),
            };

            let description: string | undefined;
            try {
                description = await cache.tryGet(`nga:forum:body:v2:${link}`, async () => {
                    const response = await got.post('https://ngabbs.com/app_api.php?__lib=post&__act=list', {
                        headers: {
                            'X-User-Agent': X_UA,
                            Cookie: cookieString,
                        },
                        form: {
                            tid,
                        },
                    });

                    if (response.data.code === 2048) {
                        throw new LoginRequiredError(response.data.msg);
                    }
                    if (response.data.code !== 0) {
                        throw new Error(`NGA article request failed: ${response.data.msg || response.data.code}`);
                    }
                    return formatContent(response.data.result[0].content);
                });
            } catch (error) {
                if (!(error instanceof LoginRequiredError)) {
                    throw error;
                }
            }

            item.description = description;
            return item;
        },
        { concurrency: 3 }
    );

    return {
        title: `NGA-${forumname}${recommend ? '-精华' : ''}`,
        link: `https://nga.178.com/thread.php?fid=${fid}`,
        description: 'NGA是国内专业的游戏玩家社区,魔兽世界,英雄联盟,炉石传说,风暴英雄,暗黑破坏神3(D3)游戏攻略讨论,以及其他热门游戏玩家社区',
        item: resultItem,
    };
}
