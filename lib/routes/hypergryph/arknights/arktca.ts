import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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
    url: 'aneot.arktca.com',
    maintainers: ['Bendancom'],
    radar: [
        {
            source: ['aneot.arktca.com'],
        },
    ],
    description: `
        期刊《回归线》 | 泰拉创作者联合会
    `,
    handler,
};

async function handler() {
    const baseURL = 'https://aneot.arktca.com';
    const { data: allResponse } = await got(`${baseURL}/posts`);
    const $ = load(allResponse);

    const allURLList = $(`div.theme-hope-content > table`)
        .find('a')
        .toArray()
        .map((item) => baseURL + $(item).prop(`href`));

    const journalList = await Promise.all(
        allURLList.map(async (item) => {
            const { data: response } = await got(item);
            const $$ = load(response);
            const reg_vol = /(?<=Vol. )(\w+)/;
            const match = reg_vol.exec($$('div.vp-page-title').find('h1').text());
            const volume = match ? match[0] : '';
            const urls = $$('div.theme-hope-content > ul a')
                .toArray()
                .map((e) => baseURL + $(e).prop('href'));
            return {
                volume,
                urls,
            };
        })
    );

    const journals = await Promise.all(
        journalList.map((item) =>
            cache.tryGet(
                `item:urls`,
                async () =>
                    await Promise.all(
                        item.urls.map(async (url) => {
                            const { data: response } = await got(url);
                            const $$ = load(response);
                            $$(`div.ads-container`).remove();

                            const language = $$(`html`).prop('lang');

                            const page_title = $$('div.vp-page-title');
                            const title = `Vol. ${item.volume} ` + page_title.children('h1').text();

                            const page_info = page_title.children('div.page-info');

                            const page_author_info = page_info.children(`span.page-author-info`);
                            const author = page_author_info.find('span.page-author-item').text();

                            const page_date_info = page_info.children(`span.page-date-info`);
                            const date = page_date_info.children(`meta`).prop(`content`);
                            const pubDate = parseDate(date);

                            const page_category_info = page_info.find('span.page-category-info');
                            const category = page_category_info.children('meta').prop('content');

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
            )
        )
    );

    const items = journals.flat(Infinity);

    return {
        title: `回归线`,
        link: `http://aneot.arktca.com`,
        description: `期刊《回归线》| 泰拉创作者联合会
        `,
        icon: `http://aneot.arktca.com/logo.svg`,
        logo: 'http://aneot.arktca.com/logo.svg',
        image: 'http://aneot.arktca.com/logo.svg',
        author: `Bendancom`,
        language: 'zh-CN',
        item: items,
    };
}
