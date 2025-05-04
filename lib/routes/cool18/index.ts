import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';

type PageDataItem = {
    tid: string;
    username: string;
    subject: string;
    dateline: string;
    type: string;
};

export const route: Route = {
    path: '/:id/:type?/:keyword?/:pageSize?',
    url: 'cool18.com',
    example: 'cool18.com/bbs4',
    parameters: {
        id: 'the name of the bbs',
        type: 'the type of the post. Can be `home`, `gold` or `threadsearch`. Default: `home`',
        keyword: 'the keyword to search.',
        pageSize: 'the number of posts to fetch. If the type is not in search, you can type any words. Default: 10',
    },
    categories: ['bbs'],
    radar: [
        {
            source: ['cool18.com/:id/', 'www.cool18.com/:id/index.php?action=search&bbsdr=:id&act=:type&app=forum&keywords=:keyword&submit=%E6%9F%A5%E8%AF%A2', 'www.cool18.com/:id/index.php?app=forum&act=:type'],
            target: '/:id/:type?/:keyword?',
        },
    ],
    name: '留园网',
    maintainers: ['nczitzk', 'Gabrlie'],
    handler,
};

async function handler(ctx: Context) {
    const { id, type = 'home', keyword, pageSize = '10' } = ctx.req.param();

    const rootUrl = 'https://www.cool18.com/' + id + '/index.php';
    const params = type === 'home' ? '' : (type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&keywords=${keyword}&submit=查询`);

    const currentUrl = rootUrl + params;

    const response = await ofetch(currentUrl);

    const $ = load(response);
    let list: any[];

    if (type === 'home') {
        const scripts = $('script').toArray();
        let pageData = [];
        for (const script of scripts) {
            const scriptContent = $(script).html();
            const match = scriptContent?.match(/const\s+_PageData\s*=\s*(\[[\s\S]*?]);/);

            if (match) {
                pageData = JSON.parse(match[1]);
            }
        }
        pageData.length = Number(pageSize);
        list = pageData.map((item: PageDataItem) => ({
            title: item.subject,
            link: `${rootUrl}?app=forum&act=threadview&tid=${item.tid}`,
            pubDate: parseDate(item.dateline, 'MM/DD/YY'),
            author: item.username,
            category: item.type,
            description: '',
        }));
    } else {
        list = $('#d_list ul li, #thread_list li, .t_l .t_subject')
            .slice(0, Number(pageSize))
            .toArray()
            .map((item) => {
                const a = $(item).find('a').first();

                return {
                    title: a.text(),
                    link: `${rootUrl}/${a.attr('href')}`,
                    pubDate: parseDate($(item).find('i').text(), 'MM/DD/YY'),
                    author: $(item).find('a').last().text(),
                    category: a.find('span').first().text(),
                    description: '',
                };
            });
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const preElement = content('pre');
                if (preElement.length > 0) {
                    const htmlContent = preElement.html();
                    item.description = htmlContent ? htmlContent.replaceAll(/<font color="#E6E6DD">cool18.com<\/font>/g, '') : '';
                }
                return item;
            })
        )
    );

    return {
        title: '123',
        link: currentUrl,
        item: items,
    };
}
