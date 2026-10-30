import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parseNewsDate(sourceDate: string, format: string) {
    if (!sourceDate) {
        return;
    }
    const date = parseDate(sourceDate, format);
    if (Number.isFinite(date.valueOf())) {
        return timezone(date, 8);
    }
}

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'description' | 'pubDate' | 'author'>> {
    if (!link.startsWith('https://www.tsinghua.edu.cn/info/')) {
        return {};
    }
    const response = await ofetch(link);
    const $ = load(response);
    const main = $('.v_news_content');
    let reporter: string | undefined;
    let contributor: string | undefined;
    main.find('p').each((_, element) => {
        const paragraph = $(element);
        const text = paragraph.text().trim();
        const byline = text.match(/^●(?:记者|学生通讯员)\s+(\S.*)$/);
        if (byline) {
            reporter = byline[1];
            paragraph.remove();
        } else if (/(?:^|;)\s*text-align\s*:\s*right\s*(?:;|$)/i.test(paragraph.attr('style') || '')) {
            const metadata = text.match(/^(供稿|编辑|审核)[：:]([^\n]+)$/);
            if (metadata) {
                if (metadata[1] === '供稿') {
                    contributor = metadata[2].trim();
                }
                paragraph.remove();
            }
        }
    });

    return {
        description: main.html() || undefined,
        pubDate: parseNewsDate($('.sj p').text().trim(), 'YYYY年MM月DD日 HH:mm:ss'),
        author: reporter || contributor,
    };
}

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
            source: ['www.tsinghua.edu.cn/news.htm'],
            target: '/news',
        },
        {
            source: ['www.tsinghua.edu.cn/news/ttxw.htm'],
            target: '/news/ttxw',
        },
        {
            source: ['www.tsinghua.edu.cn/news/zttj.htm'],
            target: '/news/zttj',
        },
        {
            source: ['www.tsinghua.edu.cn/news/zxdt.htm'],
            target: '/news/zxdt',
        },
        {
            source: ['www.tsinghua.edu.cn/news/mtqh.htm'],
            target: '/news/mtqh',
        },
        {
            source: ['www.tsinghua.edu.cn/news/zhsx.htm'],
            target: '/news/zhsx',
        },
        {
            source: ['www.tsinghua.edu.cn/news/rcpy.htm'],
            target: '/news/rcpy',
        },
        {
            source: ['www.tsinghua.edu.cn/news/xsky.htm'],
            target: '/news/xsky',
        },
        {
            source: ['www.tsinghua.edu.cn/news/jlhz.htm'],
            target: '/news/jlhz',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhrw.htm'],
            target: '/news/qhrw',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qqxy.htm'],
            target: '/news/qqxy',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhly.htm'],
            target: '/news/qhly',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhgj.htm'],
            target: '/news/qhgj',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhsy.htm'],
            target: '/news/qhsy',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhsk.htm'],
            target: '/news/qhsk',
        },
        {
            source: ['www.tsinghua.edu.cn/news/qhxk.htm'],
            target: '/news/qhxk',
        },
        {
            source: ['www.tsinghua.edu.cn/news/xwhj.htm'],
            target: '/news/xwhj',
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

    const firstArticleLink = $('.qhrw2_first a').attr('href');
    const list: DataItem[] = [
        ...$('.left li a')
            .toArray()
            .filter((item) => $(item).attr('href'))
            .map((item) => {
                const $item = $(item);
                const sj = $item.find('.sj');

                return {
                    title: $item.find('.bt').text(),
                    link: new URL($item.attr('href')!, baseUrl).href?.replace('http://', 'https://'),
                    pubDate: parseNewsDate(`${sj.find('span').text().trim()}.${sj.find('p').text().trim()}`, 'YYYY.MM.DD'),
                };
            }),
        ...(firstArticleLink
            ? [
                  {
                      title: $('.qhrw2_first .bt').text(),
                      link: new URL(firstArticleLink, link).href.replace('http://', 'https://'),
                      pubDate: parseNewsDate(`${$('.qhrw2_first .sj span').text().trim()}.${$('.qhrw2_first .sj p').text().trim()}`, 'YYYY.MM.DD'),
                  },
              ]
            : []),
    ];

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`tsinghua:news:detail:${item.link}`, () => fetchArticleDetails(item.link!));
            return { ...item, description: details.description, pubDate: details.pubDate ?? item.pubDate, author: details.author };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
