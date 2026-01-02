import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type PageDataItem = {
    tid: string;
    username: string;
    subject: string;
    dateline: string;
    type: string;
};

export const route: Route = {
    path: '/:id?/:type?/:keyword?',
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
            source: ['cool18.com/:id/'],
            target: '/:id/:type?/:keyword?',
        },
    ],
    name: '禁忌书屋',
    maintainers: ['nczitzk', 'Gabrlie'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx: Context) {
    const { id = 'bbs4', type = 'home', keyword } = ctx.req.param();

    const rootUrl = 'https://www.cool18.com/' + id + '/index.php';
    const params = type === 'home' ? '' : type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&keywords=${keyword}&submit=查询`;

    const currentUrl = rootUrl + params;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string) : 20;

    const list =
        type === 'home'
            ? JSON.parse(
                  $('script:contains("_PageData")')
                      .text()
                      .match(/const\s+_PageData\s*=\s*(\[[\s\S]*?]);/)?.[1] || '[]'
              )
                  .slice(0, limit)
                  .map((item: PageDataItem) => ({
                      title: item.subject,
                      link: `${rootUrl}?app=forum&act=threadview&tid=${item.tid}`,
                      pubDate: parseDate(item.dateline, 'MM/DD/YY'),
                      author: item.username,
                      category: item.type,
                      description: '',
                  }))
            : $('#d_list ul li, #thread_list li, .t_l .t_subject')
                  .slice(0, limit)
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

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);
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
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
