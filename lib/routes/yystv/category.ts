import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { fetchDataItemCached } from './fetcher';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['game'],
    example: '/yystv/category/recommend',
    parameters: { category: '专栏类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游研社 - 分类文章',
    maintainers: ['LightStrawberry', 'dousha'],
    handler,
    description: `| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 | 业界     |
| --------- | ------- | ------ | ------- | ---- | -------- | -------- |
| recommend | history | big    | culture | news | retro    | industry |`,
};

type RawArticleDescription = {
    title: string;
    link: string;
    pubDate: string | Date;
    author?: string;
};

function getDescription(items: RawArticleDescription[]): Promise<DataItem[]> {
    return Promise.all(
        items.map((item) =>
            fetchDataItemCached(item.link, (pageContent) => {
                const $ = load(pageContent);
                const articleContent = $('.doc-content.rel').html() || '';

                const assembledItem: DataItem = { ...item, description: articleContent };
                return assembledItem;
            })
        )
    );
}

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://www.yystv.cn/b/${category}`;
    const response = await ofetch(url);
    const $ = load(response);

    const first_part = $('.b-list-main-item')
        .toArray()
        .map((element) => {
            const s = $(element);
            const info = {
                title: s.find('.b-main-info-title').text(),
                link: 'https://www.yystv.cn' + s.find('.b-main-info-title a').attr('href'),
                pubDate: parseRelativeDate(s.find('.b-main-createtime').text()),
                author: s.find('.b-author').text(),
            } satisfies RawArticleDescription;
            return info;
        });

    const second_part = $('.list-container li')
        .toArray()
        .map((element) => {
            const s = $(element);
            const articleDate = s.find('.c-999').text();
            const info = {
                title: s.find('.list-article-title').text(),
                link: 'https://www.yystv.cn' + s.find('a').attr('href'),
                pubDate: articleDate.includes('-') ? parseDate(articleDate) : parseRelativeDate(articleDate),
                author: s.find('.handler-author-link').text(),
            } satisfies RawArticleDescription;
            return info;
        });

    const entries = [...first_part, ...second_part];

    return await getDescription(entries).then((items) => ({
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/b/${category}`,
        item: items,
    }));
}
