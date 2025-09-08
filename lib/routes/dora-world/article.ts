import { Route, Data, DataItem, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.dora-world.com';

export const route: Route = {
    path: '/article/:topic/:topicId?',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/dora-world/article/contents',
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
            source: ['www.dora-world.com/:topic'],
        },
    ],
    name: 'Article',
    maintainers: ['AChangAZha'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { topic, topicId = '' } = ctx.req.param();
    const topicIdParam = topicId === '' ? '' : `?t=${topicId}`;
    const link = `${baseUrl}/${topic}${topicIdParam}`;
    const { data: html } = await got(baseUrl);
    const $ = load(html);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const nextBuildId = nextData.buildId;
    const { data: response } = await got(`${baseUrl}/_next/data/${nextBuildId}/${topic}.json${topicIdParam}`);
    const title = `${response.pageProps.label_name} - ドラえもんチャンネル`;
    const contents = response.pageProps.contents;
    const list = contents.map((item) => ({
        title: item.title,
        link: item.page_url.startsWith('http') ? item.page_url : `${baseUrl}${item.page_url}`,
        description: item.page_url.startsWith('/contents/') ? '' : `<p>${item.title}</p><img src="${item.image_url}" alt="">`,
        pubDate: timezone(parseDate(item.publish_at), +9),
        category: item.tags.map((tag) => tag.name),
        guid: item.id,
    }));
    return {
        title,
        link,
        language: 'ja',
        image: 'https://dora-world.com/assets/images/DORAch_web-touch-icon.png',
        item: (await Promise.all(
            list.map(
                async (item) =>
                    await cache.tryGet(item.link, async () => {
                        if (item.description === '') {
                            item.description = await getContent(nextBuildId, item.guid);
                        }
                        return item;
                    })
            )
        ).then((items) => items.filter((item) => item !== null))) as DataItem[],
    };
}

async function getContent(nextBuildId: string, contentId: string) {
    const { data: response } = await got(`${baseUrl}/_next/data/${nextBuildId}/contents/${contentId}.json`);
    const $ = load(response.pageProps.content.content);
    const content = $('.main_unit');
    content.find('.tag').remove();
    content.find('div[style="display:none"]').remove();
    const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
    const description =
        content
            .html()
            ?.replaceAll(rubyRegex, '$1（$2）')
            ?.replaceAll(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm, '') ?? '';
    return description;
}
