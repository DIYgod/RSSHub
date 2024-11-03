import { Route, ViewType } from '@/types';
import { getFulltext } from './utils-fulltext';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseArticle } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media', 'popular'],
    view: ViewType.Articles,
    example: '/caixin/latest',
    parameters: {},
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
            source: ['caixin.com/'],
        },
    ],
    name: '最新文章',
    maintainers: ['tpnonthealps'],
    handler,
    url: 'caixin.com/',
    description: `说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。订阅用户可根据文档设置环境变量后，在url传入\`fulltext=\`以解锁全文。`,
};

async function handler(ctx) {
    const { data } = await got('https://gateway.caixin.com/api/dataplatform/scroll/index');

    const list = data.data.articleList
        .map((e) => ({
            title: e.title,
            link: e.url,
            pubDate: e.time,
            category: e.channelObject.name,
        }))
        .filter((item) => !item.link.startsWith('https://fm.caixin.com/') && !item.link.startsWith('https://video.caixin.com/') && !item.link.startsWith('https://datanews.caixin.com/')); // content filter

    const rss = await Promise.all(
        list.map((item) =>
            cache.tryGet(`caixin:latest:${item.link}`, async () => {
                // desc
                const desc = await parseArticle(item);

                item.description = ctx.req.query('fulltext') === 'true' ? ((await getFulltext(item.link)) ?? desc.description) : desc.description;
                // prevent cache coliision with /caixin/article and /caixin/:column/:category
                // since those have podcasts
                item.guid = `caixin:latest:${item.link}`;

                return { ...desc, ...item };
            })
        )
    );

    return {
        title: '财新网 - 最新文章',
        link: 'https://www.caixin.com/',
        item: rss,
    };
}
