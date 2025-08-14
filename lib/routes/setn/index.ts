import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const defaultRootUrl = 'https://www.setn.com';

const rootUrls = {
    娛樂: 'https://star.setn.com',
    健康: 'https://health.setn.com',
    旅遊: 'https://travel.setn.com',
    富房網: 'https://fuhouse.setn.com',
    女孩: 'https://watch.setn.com',
};

const ids = {
    即時: '',
    熱門: 0,
    政治: 6,
    社會: 41,
    國際: 5,
    兩岸: 68,
    生活: 4,
    運動: 34,
    地方: 97,
    財經: 2,
    名家: 9,
    新奇: 42,
    科技: 7,
    汽車: 12,
    寵物: 47,
    HOT焦點: 31,
};

const getCurrentUrl = (category) => {
    const rootUrl = Object.hasOwn(rootUrls, category) ? rootUrls[category] : defaultRootUrl;

    if (Object.hasOwn(ids, category)) {
        return `${rootUrl}/ViewAll.aspx${ids[category] === '' ? '' : `?PageGroupID=${ids[category]}`}`;
    }

    return `${rootUrl}/viewall`;
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/setn',
    parameters: { category: '分类，见下表，默认为即時' },
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
            source: ['setn.com/ViewAll.aspx', 'setn.com/'],
            target: '',
        },
    ],
    name: '新聞',
    maintainers: ['nczitzk'],
    handler,
    url: 'setn.com/ViewAll.aspx',
    description: `| 即時 | 熱門 | 娛樂 | 政治 | 社會 |
| ---- | ---- | ---- | ---- | ---- |

| 國際 | 兩岸 | 生活 | 健康 | 旅遊 |
| ---- | ---- | ---- | ---- | ---- |

| 運動 | 地方 | 財經 | 富房網 | 名家 |
| ---- | ---- | ---- | ------ | ---- |

| 新奇 | 科技 | 汽車 | 寵物 | 女孩 | HOT 焦點 |
| ---- | ---- | ---- | ---- | ---- | -------- |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '即時';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 42;

    const currentUrl = getCurrentUrl(category);

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#NewsList, .newsList, .hotNewsList')
        .find('.newsItems, .st-news, .all_three_list, div.title-word')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').last();
            const link = a.attr('href').replaceAll(/(\?|&)utm_campaign=.*/g, '');

            return {
                title: a.text(),
                link: link.startsWith('http') ? link : `${Object.hasOwn(rootUrls, category) ? rootUrls[category] : defaultRootUrl}${link}`,
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

                let head = {};
                try {
                    head = JSON.parse(content('script[type="application/ld+json"]').first().text());
                } catch {
                    head = {};
                }

                content('#gad_setn_innity_oop_1x1').remove();

                item.title = content('h1').text();
                item.author = head?.author?.name || content('meta[name="author"]').attr('content');
                item.category = [content('meta[property="article:section"]').attr('content'), ...content('meta[name="news_keywords"]').attr('content').split(',')];
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.description = content('article, .content-p').html();

                return item;
            })
        )
    );

    return {
        title: `三立新聞網 - ${category}`,
        link: currentUrl,
        item: items,
    };
}
