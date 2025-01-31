import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    0: '全部',
    15: '直播',
    3: '科技新鲜事',
    7: '互联网槽点',
    5: '趣味科技',
    6: 'DEBUG TIME',
    1: '游戏',
    8: '视频',
    9: '公里每小时',
};

export const route: Route = {
    path: '/news/:caty?',
    categories: ['new-media', 'popular'],
    example: '/chaping/news/15',
    parameters: { caty: '分类，默认为全部资讯' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 编号 | 分类       |
| ---- | ---------- |
| 15   | 直播       |
| 3    | 科技新鲜事 |
| 7    | 互联网槽点 |
| 5    | 趣味科技   |
| 6    | DEBUG TIME |
| 1    | 游戏       |
| 8    | 视频       |
| 9    | 公里每小时 |`,
};

async function handler(ctx) {
    const caty = ctx.req.param('caty') ?? '';

    const targetUrl = `https://chaping.cn/news?cate=${caty}`;
    const currentUrl = `https://chaping.cn/api/official/information/news?page=1&limit=16&cate=${caty}`;
    const apiResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = apiResponse.data.data.map((item) => ({
        title: item.title,
        link: `https://chaping.cn/news/${item.id}`,
        pubDate: parseDate(item.time_publish_timestamp * 1000),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = JSON.parse(detailResponse.data.match(/"current":(.*?),"optionsList":/)[1]);

                item.description = content.content;

                return item;
            })
        )
    );

    return {
        title: `差评资讯 - ${titles[ctx.req.param('caty') === '' ? 0 : ctx.req.param('caty')]}`,
        link: targetUrl,
        item: items,
    };
}
