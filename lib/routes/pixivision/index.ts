import { Route, DataItem, Data, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { processContent } from './utils';

export const route: Route = {
    path: '/:lang/:category?',
    categories: ['anime', 'popular'],
    view: ViewType.Articles,
    example: '/pixivision/zh-tw',
    parameters: { lang: 'Language', category: 'Category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['SnowAgar25'],
    description: `::: tip
  \`https://www.pixivision.net/zh-tw/c/interview\` → \`/pixivision/zh-tw/interview\`
:::`,
    radar: [
        {
            source: ['www.pixivision.net/:lang'],
            target: '/:lang',
        },
        {
            source: ['www.pixivision.net/:lang/c/:category'],
            target: '/:lang/:category',
        },
    ],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { lang, category } = ctx.req.param();
    const baseUrl = 'https://www.pixivision.net';
    const url = category ? `${baseUrl}/${lang}/c/${category}` : `${baseUrl}/${lang}`;

    const headers = {
        headers: {
            Cookie: `user_lang=${lang.replace('-', '_')}`, // zh-tw → zh_tw
        },
    };

    const { data: response } = await got(url, headers);
    const $ = load(response);

    const list = $('li.article-card-container a[data-gtm-action="ClickTitle"]')
        .toArray()
        .map((elem) => ({
            title: $(elem).text(),
            link: new URL($(elem).attr('href') ?? '', baseUrl).href,
        }));

    const items = await Promise.all(
        list.map(async (item) => {
            const result = await cache.tryGet(item.link, async () => {
                const { data: articleData } = await got(item.link, headers);
                const $article = load(articleData);

                const processedDescription = processContent($article, lang);

                return {
                    title: item.title,
                    description: processedDescription,
                    link: item.link,
                    pubDate: parseDate($article('time').attr('datetime') ?? ''),
                } as DataItem;
            });
            return result;
        })
    );

    return {
        title: `${$('.ssc__header').length ? $('.ssc__header').text() : 'New'} - pixivision`,
        link: url,
        item: items.filter((item): item is DataItem => !!item),
    };
}
