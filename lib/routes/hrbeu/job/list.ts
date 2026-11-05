import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const rootUrl = 'http://job.hrbeu.edu.cn';

const idMap = {
    tzgg: {
        name: '通知公告',
        url: 'http://job.hrbeu.edu.cn/frontpage/hrbeu/html/newsList.html?id=00160103',
    },
    rdxw: {
        name: '热点新闻',
        url: 'http://job.hrbeu.edu.cn/frontpage/hrbeu/html/newsList.html?id=00160102',
    },
};

export const route: Route = {
    path: '/job/list/:id',
    categories: ['university'],
    example: '/hrbeu/job/list/tzgg',
    parameters: { id: '栏目，如下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '就业服务平台',
    maintainers: ['Derekmini'],
    description: `| 通知公告 | 热点新闻 |
| :------: | :------: |
|   tzgg   |   rdxw   |`,
    handler,
};

type NewsItem = {
    id: string;
    title: string;
    url: string;
    isExternalLink: boolean;
    releaseDate?: string;
    updateDate?: string;
    description?: string;
    publisher?: string;
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!Object.hasOwn(idMap, id)) {
        throw new InvalidParameterError('Invalid id: expected tzgg or rdxw.');
    }
    const link = idMap[id].url;
    const { data } = await got.post(`${rootUrl}/f/newsCenter/ajax_thisNewsAndSiblingCategoryList`, {
        form: { categoryId: new URL(link).searchParams.get('id'), pageNo: 1, pageSize: 10 },
    });
    if (data.state !== 1) {
        throw new Error(`The employment website returned an error: ${data.msg}`);
    }
    const list: NewsItem[] = data.object.newsPage.list;
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`hrbeu:job:${item.id}`, async (): Promise<DataItem> => {
                const result: DataItem = {
                    title: item.title,
                    link: new URL(item.url, rootUrl).href,
                    guid: item.id,
                    pubDate: item.releaseDate ? timezone(parseDate(item.releaseDate), 8) : undefined,
                    updated: item.updateDate ? timezone(parseDate(item.updateDate), 8) : undefined,
                    author: item.publisher,
                    description: item.description,
                };
                if (!item.isExternalLink) {
                    const { data: detail } = await got(`${rootUrl}/f/newsCenter/ajax_view?id=${item.id}`);
                    if (detail.state !== 1) {
                        throw new Error(`The employment website could not load article ${item.id}: ${detail.msg}`);
                    }
                    result.description = detail.object.article.articleData.content;
                } else if (new URL(result.link!).hostname === 'mp.weixin.qq.com') {
                    await finishArticleItem(result);
                }
                return result;
            }),
        { concurrency: 3 }
    );
    return {
        title: '就业服务平台-' + idMap[id].name,
        link,
        item: items,
    };
}
