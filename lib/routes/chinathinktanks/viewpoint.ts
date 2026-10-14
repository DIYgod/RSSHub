import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.chinathinktanks.org.cn';

export const route: Route = {
    path: '/:id',
    categories: ['study'],
    example: '/chinathinktanks/57',
    parameters: { id: '新版网站分类 URL 中的 UUID，见下表。旧 id 57、46 分别保留为智库资讯、研究报告。' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '观点与实践',
    maintainers: ['Aeliu'],
    handler,
    description: `网站已迁移，其他旧数字分类已下线，请使用新版分类 URL 中的 UUID。

| id                                   | 分类     |
| ------------------------------------ | -------- |
| 87e1e7e4-ffcb-401d-aa8a-c086b9eccec1 | 智库资讯 |
| 54a1eca3-4e67-464d-bad3-eae6ac25c96a | 研究成果 |
| 4e93db34-5604-41c0-96e7-51dcebcf6735 | 全球经济 |
| 74af5bf8-131d-4b73-b7ec-83013608388e | 调研数据 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let categoryId = id;
    if (id === '57') {
        categoryId = '87e1e7e4-ffcb-401d-aa8a-c086b9eccec1';
    } else if (id === '46') {
        categoryId = '54a1eca3-4e67-464d-bad3-eae6ac25c96a';
    } else if (/^\d+$/.test(id)) {
        throw new InvalidParameterError('This numeric category was retired by China Think Tanks. Use the UUID from a current /category/ page URL.');
    }
    const url = new URL(`category/${categoryId}`, baseUrl);
    if (id === '46') {
        url.searchParams.set('categoryBId', '27392229-7fb7-4518-956c-8882e4c49937');
    }
    const link = url.href;
    const response = await ofetch(link);
    const $ = load(response);
    const list = $('a[href^="/article/"]')
        .filter((_, element) => $(element).find('article').length > 0)
        .toArray()
        .map((element): DataItem => {
            const node = $(element);
            const date = node.find('article .border-t span').last().text();
            return {
                title: node.find('h3').first().text(),
                link: new URL(node.attr('href')!, baseUrl).href,
                author: node.find('article .border-t span').first().text() || undefined,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const content = load(response);
                const article = content('article').first();
                const date = article.find('header time').text();
                item.title = article.find('h1').text() || item.title;
                item.description = article.find('.article-content').html();
                item.author = article.find('header .lucide-user').parent().text() || item.author;
                item.category = article
                    .find('header > div')
                    .first()
                    .find('span')
                    .toArray()
                    .map((element) => content(element).text());
                if (date) {
                    item.pubDate = timezone(parseDate(date, 'YYYY-MM-DD'), 8);
                }
                return item;
            })
        )
    );
    return {
        title: `中国智库网 —— ${$('h1').first().text()}`,
        link,
        item: items,
    };
}
