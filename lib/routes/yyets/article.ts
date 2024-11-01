import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseURL = 'https://yysub.net';

export const route: Route = {
    path: '/article/:type?',
    categories: ['multimedia', 'popular'],
    view: ViewType.Articles,
    example: '/yyets/article',
    parameters: {
        type: {
            description: '类型',
            options: [
                { value: 'all', label: '全部' },
                { value: 'news', label: '影视资讯' },
                { value: 'report', label: '收视快报' },
                { value: 'm_review', label: '人人影评' },
                { value: 't_review', label: '人人剧评' },
                { value: 'new_review', label: '新剧评测' },
                { value: 'recom', label: '片单推荐' },
            ],
            default: 'all',
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
    name: '影视资讯',
    maintainers: ['wb121017405'],
    handler,
    description: `| 全部 | 影视资讯 | 收视快报 | 人人影评  | 人人剧评  | 新剧评测    | 片单推荐 |
  | ---- | -------- | -------- | --------- | --------- | ----------- | -------- |
  |      | news     | report   | m\_review | t\_review | new\_review | recom    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    const url = `${baseURL}/article${type ? '?type=' + type : ''}`;

    const response = await got(url);
    const $ = load(response.data);

    let items = $('.article-list li .fl-info')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('h3 a').text(),
                link: `${baseURL}${e.find('h3 a').attr('href')}`,
                author: e.find('p a').text(),
                pubDate: timezone(parseDate(e.find('p').eq(2).text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.information-desc').html();
                return item;
            })
        )
    );

    return {
        title: `${$('title').text()} - 人人影视`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
    };
}
