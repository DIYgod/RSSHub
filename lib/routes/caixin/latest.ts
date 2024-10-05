import { Route, ViewType } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

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
    description: `说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。`,
};

async function handler() {
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
                const entry_r = await got(item.link);
                const $ = load(entry_r.data);

                // desc
                const desc = art(path.join(__dirname, 'templates/article.art'), {
                    item,
                    $,
                });

                item.description = desc;
                // prevent cache coliision with /caixin/article and /caixin/:column/:category
                // since those have podcasts
                item.guid = `caixin:latest:${item.link}`;

                return item;
            })
        )
    );

    return {
        title: '财新网 - 最新文章',
        link: 'https://www.caixin.com/',
        item: rss,
    };
}
