import { Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);
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
    maintainers: ['FYLSen'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language');
    const rootUrl = 'https://www.jimmyspa.com';

    const currentUrl = new URL(`/${language}/Books/Ajax/changeList?year=&keyword=&categoryId=0&page=1`, rootUrl).href;

    const responseData = await got(currentUrl);
    const $ = load(responseData.data.view);

    const items = $('ul#appendWork li.work_block')
        .toArray()
        .map(async (item) => {
            const $$ = load(item);
            const title = $$('p.tit').text();
            const imagesrc = $$('div.work_img img').prop('src') || '';
            const image = imagesrc ? rootUrl + imagesrc : '';
            const link = $$('li.work_block').prop('data-route');
            const contData = await got(link);
            const $cont = load(contData.data);
            const cont = $cont('article.intro_cont').html() || '';
            const wrap = $cont('div.info_wrap').html() || '';

            const contHTML = cont.replaceAll(/<img\b[^>]*>/g, (imgTag) => imgTag.replaceAll(/\b(src|data-src)="(?!http|https|\/\/)([^"]*)"/g, (attrMatch, attrName, relativePath) => {
                    const absolutePath = new URL(relativePath, rootUrl).href;
                    return `${attrName}="${absolutePath}"`;
                }));

            const match = wrap.match(/<span>(首次出版|First Published|初版)<\/span>\s*<span class="num">([^<]+)<\/span>/);

            const date = match ? match[2] : '';
            const pubDate = parseDate(date + '-02');
            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: contHTML,
            });

            return {
                title,
                link,
                description,
                pubDate,
                content: {
                    html: description,
                    text: title,
                },
            };
        });

    return {
        title: `幾米 - ${$('title').text()}(${language})`,
        link: `${rootUrl}/${language}/Books`,
        allowEmpty: true,
        item: await Promise.all(items),
    };
}
