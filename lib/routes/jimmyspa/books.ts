import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/books/:language',
    categories: ['design'],
    view: ViewType.Articles,
    example: '/jimmyspa/books/tw',
    parameters: {
        language: {
            description: '语言',
            options: [
                { value: 'tw', label: '臺灣正體' },
                { value: 'en', label: 'English' },
                { value: 'jp', label: '日本語' },
            ],
        },
    },
    radar: [
        {
            source: ['www.jimmyspa.com/:language/Books'],
        },
    ],
    name: 'Books',
    description: `| language | Description |
| -------- | ----------- |
| tw       | 臺灣正體    |
| en       | English     |
| jp       | 日本語      |`,
    maintainers: ['Cedaric'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language');
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const baseUrl = 'https://www.jimmyspa.com';
    const booksListUrl = new URL(`/${language}/Books/Ajax/changeList?year=&keyword=&categoryId=0&page=1`, baseUrl).href;

    const listResponse = await got(booksListUrl);
    const listPage = load(listResponse.data.view);

    const bookItems = listPage('ul#appendWork li.work_block')
        .toArray()
        .map(async (bookElement) => {
            const bookContent = load(bookElement);
            const bookTitle = bookContent('p.tit').text();
            const bookImageRelative = bookContent('div.work_img img').prop('src') || '';
            const bookImageUrl = bookImageRelative ? baseUrl + bookImageRelative : '';
            const bookDetailUrl = bookContent('li.work_block').prop('data-route');

            const { processedDescription, publishDate } = await cache.tryGet(`${bookDetailUrl}:details`, async () => {
                const detailResponse = await got(bookDetailUrl);
                const detailPage = load(detailResponse.data);
                const bookDescription = detailPage('article.intro_cont').html() || '';
                const bookInfoWrap = detailPage('div.info_wrap').html() || '';

                const processedDescription = bookDescription.replaceAll(/<img\b[^>]*>/g, (imgTag) =>
                    imgTag.replaceAll(/\b(src|data-src)="(?!http|\/\/)([^"]*)"/g, (_, attrName, relativePath) => {
                        const absoluteImageUrl = new URL(relativePath, baseUrl).href;
                        return `${attrName}="${absoluteImageUrl}"`;
                    })
                );

                const publishDateMatch = bookInfoWrap.match(/<span>(首次出版|First Published|初版)<\/span>\s*<span class="num">([^<]+)<\/span>/);
                const publicationDate = publishDateMatch?.[2];
                const publishDate =
                    publicationDate && /^\d{4}-\d{2}-\d{2}$/.test(publicationDate) && Number.isFinite(parseDate(publicationDate, 'YYYY-MM-DD', true).getTime()) ? parseDate(`${publicationDate}T00:00:00+08:00`) : undefined;

                return {
                    processedDescription,
                    publishDate,
                };
            });

            const renderedDescription = renderDescription({
                images: bookImageUrl
                    ? [
                          {
                              src: bookImageUrl,
                              alt: bookTitle,
                          },
                      ]
                    : undefined,
                description: processedDescription,
            });

            return {
                title: bookTitle,
                link: bookDetailUrl,
                description: renderedDescription,
                pubDate: publishDate,
                content: {
                    html: renderedDescription,
                },
            };
        });

    return {
        title: `幾米 - 幾米創作(${language})`,
        link: `${baseUrl}/${language}/Books`,
        item: await Promise.all(bookItems),
    };
}
