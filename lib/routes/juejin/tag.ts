import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getFeedItem, parseList } from './utils';

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

    const idResponse = await ofetch('https://api.juejin.cn/tag_api/v1/query_tag_detail', {
        method: 'POST',
        body: {
            key_word: tag,
        },
    });

    const id = idResponse.data.tag_id;

    const response = await ofetch('https://api.juejin.cn/recommend_api/v1/article/recommend_tag_feed', {
        method: 'POST',
        body: {
            id_type: 2,
            cursor: '0',
            tag_ids: [id],
            sort_type: 300,
        },
    });

    const list = parseList(response.data);
    const resultItems = await Promise.all(getFeedItem(list));

    return {
        title: `掘金 ${tag}`,
        link: `https://juejin.cn/tag/${encodeURIComponent(tag)}`,
        description: `掘金 ${tag}`,
        image: idResponse.data.tag.icon,
        item: resultItems,
    };
}
