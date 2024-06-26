import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const rssDescription = `期刊《回归线》 | 泰拉创作者联合会`;
const Url = 'aneot.arktca.com';
const Author = `Bendancom`;

export const route: Route = {
    path: '/arknights/arktca',
    categories: ['game'],
    example: '/hypergryph/arknights/arktca',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '期刊',
    url: String(Url),
    maintainers: [String(Author)],
    radar: [
        {
            source: [String(Url)],
        },
    ],
    description: String(rssDescription),
    handler,
};

async function handler() {
    const baseUrl = `https://${Url}`;
    const { data: allResponse } = await got(`${baseUrl}/posts`);
    const $ = load(allResponse);

    const allUrlList = $(`div.theme-hope-content > table`)
        .find('a')
        .toArray()
        .map((item) => baseUrl + $(item).prop(`href`));

    const journalList = await Promise.all(
        allUrlList.map(async (item) => {
            const { data: response } = await got(item);
            const $$ = load(response);
            const reg_vol = /(?<=Vol. )(\w+)/;
            const match = reg_vol.exec($$('div.vp-page-title').find('h1').text());
            const volume = match ? match[0] : '';
            const urls = $$('div.theme-hope-content > ul a')
                .toArray()
                .map((e) => baseUrl + $(e).prop('href'));
            return {
                volume,
                urls,
            };
        })
    );

    const journals = await Promise.all(
        journalList.map(async (item) => await Promise.all(
                item.urls.map((url) =>
                    cache.tryGet(`url`, async () => {
                        const { data: response } = await got(url);
                        const $$ = load(response);

                        $$(`div.ads-container`).remove();
                        const language = $$(`html`).prop('lang');

                        const pageTitle = $$('div.vp-page-title');

                        const title = `Vol.${item.volume} ` + pageTitle.children('h1').text();
                        const pageInfo = pageTitle.children('div.page-info');

                        const pageAuthorInfo = pageInfo.children(`span.page-author-info`);
                        const author = pageAuthorInfo.find('span.page-author-item').text();

                        const pageDateInfo = pageInfo.children(`span.page-date-info`);
                        const date = pageDateInfo.children(`meta`).prop(`content`);
                        const pubDate = parseDate(date);

                        const pageCategoryInfo = pageInfo.find('span.page-category-info');
                        const category = pageCategoryInfo.children('meta').prop('content');

                        const article = $$(`div.theme-hope-content`);
                        const description = article.html();

                        const comments = Number.parseInt($$(`span.wl-num`).text());
                        return {
                            title,
                            language,
                            author,
                            pubDate,
                            category,
                            description,
                            comments,
                            guid: url,
                            link: url,
                        };
                    })
                )
            ))
    );

    return {
        title: `回归线`,
        link: String(baseUrl),
        description: String(rssDescription),
        icon: `${baseUrl}/logo.svg`,
        logo: `${baseUrl}/logo.svg`,
        image: `${baseUrl}/logo.svg`,
        author: String(Author),
        language: 'zh-CN',
        item: journals.flat(Infinity),
    };
}
