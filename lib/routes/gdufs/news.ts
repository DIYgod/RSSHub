import { Route } from '@/types';
import { load } from 'cheerio';
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
        list.toArray().map(async (element) => {
            const item = $(element);
            const href = item.find('a').attr('href') || '';
            const title = item.find('h5').text().trim();
            const day = item.find('h3').text().trim();
            const yearMonth = item.find('h6').text().trim();
            const dateString = yearMonth + '/' + day;
            const fullLink = href.startsWith('http') ? href : new URL(href, site).href;

            const pubDate = parseDate(dateString).toUTCString();

            let description = '';
            let author = '';

            try {
                const articleRes = await got(fullLink);
                const $$ = load(articleRes.body);
                description = $$('.v_news_content').html()?.trim() || '';

                // 提取作者信息
                const authorSpans = $$('.nav01 h6 .ll span');
                authorSpans.each((_, el) => {
                    const text = $$(el).text().trim();
                    if (text.includes('责任编辑：')) {
                        author = text.replace('责任编辑：', '').trim();
                    } else if (text.includes('文字：')) {
                        author = text.replace('文字：', '').trim();
                    }
                });
            } catch {
                description = '内容获取失败。';
            }

            return {
                title,
                link: fullLink,
                description,
                pubDate,
                author,
            };
        })
    );

    return {
        title: '广东外语外贸大学-新闻',
        link,
        description: '广东外语外贸大学-新闻',
        item: items,
    };
}
