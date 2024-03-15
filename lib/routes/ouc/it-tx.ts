import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/it/tx/:id?',
    categories: ['university'],
    example: '/ouc/it/tx/xwdt',
    parameters: { id: '默认为 `xwdt`，id过多，这里只举几个例' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['it.ouc.edu.cn/tx/:id/list.htm'],
            target: '/it/tx/:id',
        },
    ],
    name: '信息科学与工程学院团学工作',
    maintainers: ['3401797899'],
    handler,
    url: 'it.ouc.edu.cn/',
    description: `| 新闻动态 | 学院活动 | 奖助工作获奖情况 |
  | -------- | -------- | ---------------- |
  | xwdt     | tzgg     | 21758            |`,
};

async function handler(ctx) {
    const host = 'https://it.ouc.edu.cn';
    const id = ctx.req.param('id') || 'xwdt';
    const link = `${host}/tx/${id}/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const typeTitle = $('span.Column_Anchor').text();
    const title = $('li.col_title h2').text();

    const list = $('ul.wp_article_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('span.Article_PublishDate').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '中国海洋大学信息科学与工程学院';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: `信息科学与工程学院团学工作 - ${typeTitle}${title === typeTitle ? '' : title}`,
        description: '中国海洋大学信息科学与工程学院团学工作',
        link,
        item: out,
    };
}
