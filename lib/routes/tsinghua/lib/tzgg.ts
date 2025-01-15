import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/lib/tzgg/:category',
    categories: ['university'],
    example: '/tsinghua/lib/tzgg/qtkx',
    parameters: { category: '分类，可在对应分类页 URL 中找到' },
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
            source: ['lib.tsinghua.edu.cn/tzgg/:category'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['linsenwang'],
    handler,
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const host = `https://lib.tsinghua.edu.cn/tzgg/${category}.htm`;
    const response = await ofetch(host);
    const $ = load(response);

    const feedTitle = $('.tags .on').text();

    const list = $('ul.notice-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first().text();
            const time = item.find('.notice-date').first().text();
            const a = item.find('a').first().attr('href');

            const fullUrl = new URL(a, host).href;

            return {
                title,
                link: fullUrl,
                pubDate: time,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.v_news_content').first().html();

                return item;
            })
        )
    );

    return {
        allowEmpty: true,
        title: '图书馆通知公告 - ' + feedTitle,
        link: host,
        item: items,
    };
}
