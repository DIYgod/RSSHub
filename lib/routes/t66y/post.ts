import * as cheerio from 'cheerio';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, parseContent } from './utils';

function parseItems(tid: string, $: cheerio.CheerioAPI) {
    return $('.tr1:nth-child(1)')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const content = parseContent($item.html());
            const footer = $item.next();
            const pid = footer.find('.tipad a[title]').attr('id')?.slice(2);

            return {
                title: content?.split('<br>')[0],
                description: content,
                author: $item
                    .find('b')
                    .contents()
                    .filter((_, ele) => ele.type === 'text')
                    .text()
                    .trim(),
                pubDate: parseDate(String(footer.find('span[data-timestamp]').data('timestamp')), 'X'),
                link: `${baseUrl}/read.php?tid=${tid}${pid ? `&pid=${pid}` : ''}`,
            };
        });
}

export default async (ctx) => {
    const tid = ctx.req.param('tid') as string;
    const { data: response } = await got(`${baseUrl}/read.php?tid=${tid}`);
    // 跟踪重定向
    let $ = cheerio.load(response);
    const redirect = $('a:last-child').attr('href');
    if (!redirect) {
        throw new Error('Cannot get the redirect link');
    }

    const { data: redirectedResponse, url: link } = await got(new URL(redirect, baseUrl).href);
    $ = cheerio.load(redirectedResponse);

    const firstPage = parseItems(tid, $);

    const pageSize = $('.w70 input').eq(0).attr('value')?.split('/')[1];
    let pageUrls: string[] = [];
    if (pageSize) {
        const length = Number.parseInt(pageSize);
        pageUrls = Array.from({ length }, (_, i) => `${baseUrl}/read.php?tid=${tid}&page=${i + 1}`).slice(1);
    }

    // 请求帖子
    const nextPages = pageSize
        ? await Promise.all(
              pageUrls.map((url) =>
                  cache.tryGet(url, async () => {
                      const { data: res } = await got(url);
                      const $ = cheerio.load(res);

                      return parseItems(tid, $);
                  })
              )
          )
        : [];

    const items = [...firstPage, ...nextPages.flat()];

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
