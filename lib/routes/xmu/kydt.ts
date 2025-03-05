import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/kydt',
    categories: ['university'],
    example: '/xmu/kydt',
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
            source: ['soe.xmu.edu.cn/kxyj/kydt.htm'],
        },
    ],
    name: '科研动态',
    maintainers: ['linsenwang'],
    handler,
};

async function handler() {
    const host = 'https://soe.xmu.edu.cn/kxyj/kydt.htm';
    const response = await ofetch(host);
    const $ = load(response);

    const list = $('div.news li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h4').first().text();
            const time = item.find('h6').first().text();
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
        title: '厦门大学经济学院科研动态',
        link: host,
        item: items,
    };
}
