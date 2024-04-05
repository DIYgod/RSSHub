import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/announce/:platform?/:group?',
    categories: ['game'],
    example: '/arknights/announce',
    parameters: { platform: '平台，默认为 Android', group: '分组，默认为 ALL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游戏内公告',
    maintainers: ['swwind'],
    handler,
    description: `平台

  |  安卓服 | iOS 服 |   B 服   |
  | :-----: | :----: | :------: |
  | Android |   IOS  | Bilibili |

  分组

  | 全部 | 系统公告 | 活动公告 |
  | :--: | :------: | :------: |
  |  ALL |  SYSTEM  | ACTIVITY |`,
};

async function handler(ctx) {
    const { platform = 'Android', group = 'ALL' } = ctx.req.param();

    let {
        data: { announceList },
    } = await got({
        method: 'get',
        url: `https://ak-conf.hypergryph.com/config/prod/announce_meta/${platform}/announcement.meta.json`,
    });

    if (group !== 'ALL') {
        announceList = announceList.filter((item) => item.group === group);
    }

    announceList = await Promise.all(
        announceList.map((item) =>
            cache.tryGet(item.webUrl, async () => {
                const { data } = await got({
                    method: 'get',
                    url: item.webUrl,
                });

                const $ = load(data);
                let description =
                    // 一般来讲是有字的
                    $('.content').html() ??
                    // 有些情况只有一张图
                    $('.banner-image-container.cover').html() ??
                    // 有些情况啥都没有（暂时没有遇到）
                    'No Description';

                // 游戏内部跳转链接
                description = description.replace(/href="uniwebview:\/\/.+?"/, 'href="#"');

                return {
                    title: item.title,
                    description,
                    // 不知道是哪一年的，所以不管了
                    pubDate: parseDate(`${item.month}-${item.day}`, 'M-D'),
                    link: item.webUrl,
                };
            })
        )
    );

    return {
        title: `《明日方舟》${group === 'SYSTEM' ? '系统' : group === 'ACTIVITY' ? '活动' : '全部'}公告`,
        link: 'https://ak.hypergryph.com/',
        item: announceList,
    };
}
