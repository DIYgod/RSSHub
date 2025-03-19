import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const site = 'https://www.gdufs.edu.cn';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/gdufs/news',
    parameters: {},
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
            source: ['www.gdufs.edu.cn/gwxw/gwxw1.htm', 'www.gdufs.edu.cn/'],
        },
    ],
    name: '新闻',
    maintainers: ['gz4zzxc'],
    handler,
    url: 'www.gdufs.edu.cn/gwxw/gwxw1.htm',
};

async function handler() {
    const link = 'https://www.gdufs.edu.cn/gwxw/gwxw1.htm';

    const response = await got(link);
    const $ = load(response.body);
    const list = $('ul.list_luntan li');

    const items = await Promise.all(
        list.toArray().map((element) => {
            const item = $(element);
            const href = item.find('a').attr('href') || '';
            const title = item.find('h5').text().trim();
            const day = item.find('h3').text().trim();
            const yearMonth = item.find('h6').text().trim();
            const dateString = yearMonth + '/' + day;
            const fullLink = href.startsWith('http') ? href : new URL(href, site).href;
            const pubDate = parseDate(dateString).toUTCString();

            return cache.tryGet(fullLink, async () => {
                try {
                    const articleRes = await got(fullLink);
                    const $$ = load(articleRes.body);
                    const description = $$('.v_news_content').html()?.trim() || '';

                    let author = '';
                    const authorSpans = $$('.nav01 h6 .ll span');
                    authorSpans.each((_, el) => {
                        const text = $$(el).text().trim();
                        if (text.includes('责任编辑：')) {
                            author = text.replace('责任编辑：', '').trim();
                        } else if (text.includes('文字：')) {
                            author = text.replace('文字：', '').trim();
                        }
                    });

                    return {
                        title,
                        link: fullLink,
                        description,
                        pubDate,
                        author,
                    };
                } catch {
                    return {
                        title,
                        link: fullLink,
                        description: '内容获取失败。',
                        pubDate,
                        author: '',
                    };
                }
            });
        })
    );

    return {
        title: '广外-大学要闻',
        link,
        description: '广东外语外贸大学-大学要闻',
        item: items,
    };
}
