import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';

import { parseArticle } from './utils';
import { getFulltext } from './utils-fulltext';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
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
    description: '说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。订阅用户可根据文档设置环境变量后，在 url 传入`fulltext=`以解锁全文。',
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

    const fulltext = ctx.req.query('fulltext') === 'true';
    const cacheScope = fulltext ? `fulltext:${md5(config.caixin.cookie || '')}` : 'preview';
    const rss = await Promise.all(
        list.map((item) =>
            cache.tryGet(`caixin:latest:${cacheScope}:${item.link}`, async () => {
                // desc
                const desc = await parseArticle(item);

                if (fulltext) {
                    const authorizedFullText = await getFulltext(item.link);
                    item.description = authorizedFullText || desc.description;
                } else {
                    item.description = desc.description;
                }
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
