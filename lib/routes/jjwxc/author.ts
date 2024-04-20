import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/author/:id?',
    categories: ['reading'],
    example: '/jjwxc/author/4364484',
    parameters: { id: '作者 id，可在对应作者页中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作者最新作品',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.jjwxc.net';
    const currentUrl = new URL(`oneauthor.php?authorid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const bookEl = $('font a').first();
    const bookInfoEl = bookEl.parent();

    const bookName = bookEl.text();
    const bookUrl = new URL(bookEl.prop('href'), rootUrl).href;
    const bookStatus = bookInfoEl.find('font').first().text();
    const bookWords = bookInfoEl.find('font').eq(1).text();
    const bookUpdatedTime = bookInfoEl.parent().contents().last().text().trim();
    const bookId = bookUrl.split(/=/).pop();

    const title = `${bookName}(${bookStatus}/${bookWords}/${bookUpdatedTime})`;
    const author = $('span[itemprop="name"]').text();

    const items = [
        {
            title,
            link: bookUrl,
            description: art(path.join(__dirname, 'templates/author.art'), {
                bookName,
                bookUrl,
                bookStatus,
                bookWords,
                bookUpdatedTime,
            }),
            author,
            category: [bookStatus],
            guid: `jjwxc-${id}-${bookId}#${bookWords}`,
            pubDate: timezone(parseDate(bookUpdatedTime), +8),
        },
    ];

    const logoEl = $('div.logo a img');
    const image = `https:${logoEl.prop('src')}`;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: `${logoEl.prop('alt').replace(/logo/, '')} | ${author} - 最近更新`,
        link: currentUrl,
        description: $('span[itemprop="description"]').text(),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Description"]').prop('content'),
        author,
    };
}
