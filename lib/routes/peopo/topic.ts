import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.peopo.org';

export const route: Route = {
    path: '/topic/:topicId?',
    categories: ['traditional-media'],
    example: '/peopo/topic/159',
    parameters: { topicId: '分類 ID，見下表，默認為社會關懷' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['peopo.org/topic/:topicId'],
        target: '/topic/:topicId',
    },
    name: '新聞分類',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { topicId = '159' } = ctx.req.param();
    const url = `${baseUrl}/topic/${topicId}`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('.view-list-title')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = $('#user-info h3').text();
                item.category = $('#node-terms .inline li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                item.pubDate = timezone(parseDate($('.submitted span').text()), +8);
                item.description = ($('.field-name-field-video-id .field-items').text() ? $('.field-name-field-video-id input').attr('value') : '') + $('.post_text_s .field-items').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        language: 'zh-TW',
        item: items,
    };
}
