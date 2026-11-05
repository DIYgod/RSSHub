import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    if (!id || !/^[1-9]\d*$/.test(id)) {
        throw new InvalidParameterError('A positive numeric author ID is required.');
    }

    const rootUrl = 'https://www.jjwxc.net';
    const currentUrl = new URL(`oneauthor.php?authorid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const bookEl = $('font a').first();
    if (!bookEl.prop('href')) {
        throw new NotFoundError('No recent public work is listed for this author.');
    }
    const bookInfoEl = bookEl.parent();

    const bookName = bookEl.text();
    const bookUrl = new URL(bookEl.prop('href')!, rootUrl).href;
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
            description: renderToString(
                <table>
                    <tbody>
                        {bookName ? (
                            <tr>
                                <th>最近更新作品</th>
                                <td>
                                    <a href={bookUrl}>{bookName}</a>
                                </td>
                            </tr>
                        ) : null}
                        {bookStatus ? (
                            <tr>
                                <th>作品状态</th>
                                <td>{bookStatus}</td>
                            </tr>
                        ) : null}
                        {bookWords ? (
                            <tr>
                                <th>作品字数</th>
                                <td>{bookWords}</td>
                            </tr>
                        ) : null}
                        {bookUpdatedTime ? (
                            <tr>
                                <th>最后更新时间</th>
                                <td>{bookUpdatedTime}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            ),
            author,
            category: [bookStatus],
            guid: `jjwxc-${id}-${bookId}#${bookWords}`,
            pubDate: /\d{4}-\d{1,2}-\d{1,2}/.test(bookUpdatedTime) ? timezone(parseDate(bookUpdatedTime), 8) : undefined,
        },
    ];

    const logoEl = $('div.logo a img');
    const imageSource = logoEl.prop('src');
    const image = imageSource ? new URL(imageSource, currentUrl).href : undefined;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: `${logoEl.prop('alt')?.replace(/logo/, '') || '晋江文学城'} | ${author} - 最近更新`,
        link: currentUrl,
        description: $('span[itemprop="description"]').text(),
        language: 'zh' as const,
        image,
        icon,
        logo: icon,
        author,
    };
}
