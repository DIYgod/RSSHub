import { Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news/:language',
    categories: ['design'],
    view: ViewType.Pictures,
    example: '/jimmyspa/news/tw',
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
            source: ['www.jimmyspa.com/:language/News'],
        },
    ],
    name: 'News',
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
    const rootUrl = 'https://www.jimmyspa.com';

    const currentUrl = new URL(`/${language}/News/Ajax/changeList?year=&keyword=&categoryId=0&page=1`, rootUrl).href;

    const responseData = await got(currentUrl);

    const $ = load(responseData.data.view);

    const items = $('ul#appendNews li.card_block')
        .toArray()
        .map((item) => {
            const $$ = load(item);
            const title = $$('a.news_card .info_wrap h3').text();
            const image = $$('a.news_card .card_img img').prop('src') || '';
            const link = $$('a.news_card').prop('data-route');
            const itemdate = $$('a.news_card div.date').html() || '';
            const pubDate = convertHtmlDateToStandardFormat(itemdate.toString());

            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: $$('a.news_card .info_wrap p').text(),
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
        title: `幾米 - 最新消息(${language})`,
        link: `${rootUrl}/${language}/News`,
        allowEmpty: true,
        item: items,
    };
}

function convertHtmlDateToStandardFormat(htmlContent: string): Date | undefined {
    const dateRegex = /<p>(\d{1,2})<\/p>\s*<p>(\d{1,2})\s*\.\s*([A-Za-z]{3})<\/p>/;
    const match = htmlContent.match(dateRegex);

    if (match) {
        const day = Number.parseInt(match[1]) + 1;
        const year = match[2];
        const monthAbbreviation = match[3];

        const monthMapping: { [key: string]: string } = {
            Jan: '01',
            Feb: '02',
            Mar: '03',
            Apr: '04',
            May: '05',
            Jun: '06',
            Jul: '07',
            Aug: '08',
            Sep: '09',
            Oct: '10',
            Nov: '11',
            Dec: '12',
        };

        const month = monthMapping[monthAbbreviation] || '';

        return parseDate(`20${year}-${month}-${day}`);
    }

    return undefined;
}
