import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseItem } from './utils';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['finance'],
    example: '/gelonghui/keyword/早报',
    parameters: { keyword: '搜索关键字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索关键字',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `https://www.gelonghui.com/api/post/search/v4`;
    const { data } = await got(currentUrl, {
        searchParams: {
            keyword,
            isVipArticle: false,
            count: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20,
            page: 1,
            searchArea: 'all',
        },
    });

    const list = data.result.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.link,
        author: item.source,
        pubDate: parseDate(item.timestamp, 'X'),
    }));

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `格隆汇 - 关键词 “${keyword}” 的文章`,
        link: currentUrl,
        item: items,
        description: `找到关于 “ ${keyword} ”的文章，共${data.totalCount}个结果`,
    };
}
