import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:category?',
    categories: ['university'],
    example: '/tsinghua/news',
    parameters: { category: '分类，可在对应分类页 URL 中找到，留空为 `zxdt`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '清华新闻',
    radar: [
        {
            source: ['www.tsinghua.edu.cn/news/:category'],
            target: (_, url) => `/tsinghua/news/${new URL(url).pathname.split('/').pop()?.replace('.htm', '')}`,
        },
    ],
    maintainers: ['TonyRL'],
    url: 'www.tsinghua.edu.cn/news.htm',
    handler,
};

async function handler(ctx) {
    const { category = 'zxdt' } = ctx.req.param();
    const baseUrl = 'https://www.tsinghua.edu.cn';
    const link = `${baseUrl}/news/${category}.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = [
        ...$('.left li a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const sj = $item.find('.sj');

                return {
                    title: $item.find('.bt').text().trim(),
                    link: new URL($item.attr('href'), baseUrl).href?.replace('http://', 'https://'),
                    pubDate: parseDate(`${sj.find('span').text().trim()}.${sj.find('p').text().trim()}`, 'YYYY.MM.DD'),
                };
            }),
        ...($('.qhrw2_first').length
            ? [
                  {
                      title: $('.qhrw2_first .bt').text().trim(),
                      link: $('.qhrw2_first a').attr('href')?.replace('http://', 'https://'),
                      pubDate: parseDate(`${$('.qhrw2_first .sj span').text().trim()}.${$('.qhrw2_first .sj p').text().trim()}`, 'YYYY.MM.DD'),
                  },
              ]
            : []),
    ];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link?.startsWith('https://www.tsinghua.edu.cn/info/')) {
                    return item;
                }

                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.v_news_content').html();
                item.pubDate = timezone(parseDate($('.sj p').text().trim(), 'YYYY年MM月DD日 HH:mm:ss'), 8);

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
