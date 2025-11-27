import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseItem } from './utils';

export const route: Route = {
    path: '/home/:tag?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/gelonghui/home',
    parameters: {
        tag: {
            description: '分类标签，见下表，默认为 `web_home_page`',
            options: [
                { value: 'web_home_page', label: '推荐' },
                { value: 'stock', label: '股票' },
                { value: 'fund', label: '基金' },
                { value: 'new_stock', label: '新股' },
                { value: 'research', label: '研报' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['TonyRL'],
    handler,
    description: `| 推荐            | 股票  | 基金 | 新股       | 研报     |
| --------------- | ----- | ---- | ---------- | -------- |
| web\_home\_page | stock | fund | new\_stock | research |`,
};

async function handler(ctx) {
    const { tag = 'web_home_page' } = ctx.req.param();
    const apiUrl = `https://www.gelonghui.com/api/channels/${tag}/articles/v8`;
    const { data } = await got(apiUrl);

    const list = data.result.map((article) => {
        article = article.data;
        return {
            title: article.title,
            description: article.summary,
            link: article.link,
            author: article.nick,
            category: article.source,
            pubDate: parseDate(article.timestamp, 'X'),
        };
    });

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: '格隆汇-财经资讯动态-股市行情',
        description: '格隆汇为中国投资者出海投资及中国公司出海融资,提供海外投资,港股开户行情,科创板股票发行数据、资讯、研究、交易等一站式服务,目前业务范围主要涉及港股与美股两大市场,未来将陆续开通台湾、日本、印度、欧洲等市场.',
        image: 'https://cdn.gelonghui.com/static/web/www.ico.la.ico',
        link: 'https://www.gelonghui.com',
        item: items,
    };
}
