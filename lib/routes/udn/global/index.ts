import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/global/:category?',
    categories: ['traditional-media'],
    example: '/udn/global',
    parameters: { category: '分类，见下表，默认为首頁' },
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
            source: ['global.udn.com/global_vision/index/:category', 'global.udn.com/'],
        },
    ],
    name: '轉角國際 - 首頁',
    maintainers: ['nczitzk'],
    handler,
    description: `| 首頁 | 最新文章 | 熱門文章 |
  | ---- | -------- | -------- |
  |      | new      | hot      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const start = category === 'hot' ? 6 : 0;
    const end = category === 'new' ? 6 : 12;

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/global_vision/index${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.topic').remove();

    let items = [...$('.news_cards ul li a').toArray().slice(start, end), ...(category === '' ? $('.last24, h2').find('a').toArray() : [])].map((item) => {
        item = $(item);

        const link = item.attr('href');

        return {
            title: item.find('h3').text() || item.text(),
            link: link.startsWith('http') ? link : `${rootUrl}${item.attr('href')}`,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('#story_art_title, #story_bady_info, #story_also').remove();
                content('.social_bar, .photo_pop, .only_mobile, .area').remove();

                item.description = content('#tags').prev().html();
                item.author = content('#story_author_name').text();
                item.pubDate = timezone(parseDate(content('meta[name="date"]').attr('content')), +8);
                item.category = content('meta[name="news_keywords"]').attr('content').split(',');

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
