import { Route, Data, DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/article/:topic/:topicId?',
    categories: ['anime'],
    example: '/article/contents',
    parameters: {
        topic: 'Topic name, can be found in URL. For example: the topic name of [https://www.dora-world.com/movie](https://www.dora-world.com/movie) is `movie`',
        topicId: 'Topic id, can be found in URL. For example: the topic id of [https://www.dora-world.com/contents?t=197](https://www.dora-world.com/contents?t=197) is `197`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.dora-world.com'],
        },
    ],
    name: 'Article',
    maintainers: ['AChangAZha'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { topic, topicId = '' } = ctx.req.param();
    const baseUrl = 'https://www.dora-world.com';
    let link = `${baseUrl}/${topic}?t=${topicId}`;
    if (topicId === '') {
        link = `${baseUrl}/${topic}`;
    }
    const { data: response } = await got(link);
    const $ = load(response, { decodeEntities: false });
    const pageTile = $('head > title').text();
    const targetIndex = pageTile.indexOf('記事一覧');
    if (targetIndex === -1) {
        throw new Error('Invalid topic');
    }
    const list = $('.contents_list > .item')
        .toArray()
        .map((element) => {
            const item = $(element);
            const article = item.find('a');
            const href = article.attr('href') ?? baseUrl;
            const title = article.find('.p-nolabel').text();
            const link = href.startsWith('http') ? href : `${baseUrl}${href}`;
            let description = '';
            let category: string[] = [];
            if (!href.startsWith('/contents/')) {
                category = article
                    .find('.news_cathegory')
                    .toArray()
                    .map((item) => $(item).text().trim());
                article.find('.area_label').remove();
                description = article.html() ?? '';
            }
            return {
                title,
                link,
                description,
                category,
            };
        });
    return {
        title: pageTile.slice(0, targetIndex),
        link,
        description: $('meta[name="description"]').attr('content'),
        item: (await Promise.all(
            list.map(
                async (item) =>
                    await cache.tryGet(item.link, async () => {
                        if (item.description === '') {
                            const content = await getContent(item.link);
                            item.description = content.description;
                            item.category = content.category;
                        }
                        return item;
                    })
            )
        ).then((items) => items.filter((item) => item !== null))) as DataItem[],
    };
}

async function getContent(link: string) {
    const { data: response } = await got(link);
    const $ = load(response);
    const content = $('.main_unit');
    const category = content
        .find('.tag-media')
        .toArray()
        .map((item) => $(item).text().trim());
    content.find('.tag').remove();
    content.find('div[style="display:none"]').remove();
    const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
    const description =
        content
            .html()
            ?.replace(rubyRegex, '$1（$2）')
            ?.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm, '') ?? '';
    return {
        description,
        category,
    };
}
