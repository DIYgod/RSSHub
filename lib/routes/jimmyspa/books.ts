import { Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import cache from '@/utils/cache';
import path from 'node:path';

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
    description: `
| language | Description |
| ---   | ---   |
| tw | 臺灣正體 |
| en | English |
| jp | 日本語 |
    `,
    maintainers: ['Cedaric'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language');
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

            const { renderedDescription, publishDate } = (await cache.tryGet(bookDetailUrl, async () => {
                const detailResponse = await got(bookDetailUrl);
                const detailPage = load(detailResponse.data);
                const bookDescription = detailPage('article.intro_cont').html() || '';
                const bookInfoWrap = detailPage('div.info_wrap').html() || '';

                const processedDescription = bookDescription.replaceAll(/<img\b[^>]*>/g, (imgTag) =>
                    imgTag.replaceAll(/\b(src|data-src)="(?!http|https|\/\/)([^"]*)"/g, (_, attrName, relativePath) => {
                        const absoluteImageUrl = new URL(relativePath, baseUrl).href;
                        return `${attrName}="${absoluteImageUrl}"`;
                    })
                );

                const publishDateMatch = bookInfoWrap.match(/<span>(首次出版|First Published|初版)<\/span>\s*<span class="num">([^<]+)<\/span>/);
                const publishDate = publishDateMatch ? parseDate(publishDateMatch[2] + '-02') : '';

                const renderedDescription = art(path.join(__dirname, 'templates/description.art'), {
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
                    renderedDescription,
                    publishDate,
                };
            })) as { renderedDescription: string; publishDate: string };

            return {
                title: bookTitle,
                link: bookDetailUrl,
                description: renderedDescription,
                pubDate: publishDate,
                content: {
                    html: renderedDescription,
                    text: bookTitle,
                },
            };
        });

    return {
        title: `幾米 - 幾米創作(${language})`,
        link: `${baseUrl}/${language}/Books`,
        allowEmpty: true,
        item: await Promise.all(bookItems),
    };
}
