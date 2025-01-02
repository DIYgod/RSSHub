import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['programming'],
    example: '/juejin/tag/JavaScript',
    parameters: { tag: '标签名，可在标签 URL 中找到' },
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
            source: ['juejin.cn/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['isheng5'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');

    const idResponse = await got({
        method: 'post',
        url: 'https://api.juejin.cn/tag_api/v1/query_tag_detail',
        json: {
            key_word: tag,
        },
    });

    const id = idResponse.data.data.tag_id;

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_tag_feed',
        json: {
            id_type: 2,
            cursor: '0',
            tag_ids: [id],
            sort_type: 200,
        },
    });

    let originalData = [];
    if (response.data.data) {
        originalData = response.data.data.slice(0, 10);
    }
    const resultItems = await util.ProcessFeed(originalData, cache);

    return {
        title: `掘金 ${tag}`,
        link: `https://juejin.cn/tag/${encodeURIComponent(tag)}`,
        description: `掘金 ${tag}`,
        item: resultItems,
    };
}
