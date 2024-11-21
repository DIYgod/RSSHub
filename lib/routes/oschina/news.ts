import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { fetchArticle } from '@/utils/wechat-mp';
import { config } from '@/config';

const configs = {
    all: {
        name: '最新资讯',
        link: 'https://www.oschina.net/news/project',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_all_list?p=1&type=ajax',
    },
    industry: {
        name: '综合资讯',
        link: 'https://www.oschina.net/news/industry',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_generic_list?p=1&type=ajax',
    },
    project: {
        name: '软件更新资讯',
        link: 'https://www.oschina.net/news/project',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_project_list?p=1&type=ajax',
    },
    'industry-news': {
        name: '行业资讯',
        link: 'https://www.oschina.net/news/industry-news',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_industry_list?p=1&type=ajax',
    },
    programming: {
        name: '编程语言资讯',
        link: 'https://www.oschina.net/news/programming',
        ajaxUrl: 'https://www.oschina.net/news/widgets/_news_index_programming_language_list?p=1&type=ajax',
    },
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['programming'],
    example: '/oschina/news/project',
    parameters: { category: '板块名' },
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
            source: ['oschina.net/news/:category'],
            target: '/news/:category',
        },
    ],
    name: '资讯',
    maintainers: ['tgly307', 'zengxs'],
    handler,
    description: `| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |
  | ------------------- | ------------------------ | ------------------- | ---------------------- |
  | industry            | project                  | industry-news       | programming            |

  订阅 [全部板块资讯][osc_all] 可以使用 [https://rsshub.app/oschina/news](https://rsshub.app/oschina/news)

  [osc_all]: https://www.oschina.net/news "开源中国 - 全部资讯"

  [osc_gen]: https://www.oschina.net/news/industry "开源中国 - 综合资讯"

  [osc_proj]: https://www.oschina.net/news/project "开源中国 - 软件更新资讯"

  [osc_ind]: https://www.oschina.net/news/industry-news "开源中国 - 行业资讯"

  [osc_pl]: https://www.oschina.net/news/programming "开源中国 - 编程语言资讯"`,
};

const getCookie = () =>
    cache.tryGet(
        'oschina:cookie',
        async () => {
            const res = await ofetch.raw('https://www.oschina.net/news');
            const cookie = res.headers
                .getSetCookie()
                .map((i) => i.split(';')[0])
                .join('; ');
            return cookie;
        },
        config.cache.routeExpire,
        false
    );

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'all';
    const config = configs[category];

    const cookie = await getCookie();
    const res = await ofetch(config.ajaxUrl, {
        headers: {
            Referer: config.link,
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookie,
        },
    });
    const $ = load(res);

    $('.ad-wrap').remove();

    const list = $('.items .news-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: item.find('h3 a').attr('title'),
                description: item.find('.description p').text(),
                link: item.find('h3 a').attr('href'),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/^https?:\/\/(my|www)\.oschina.net\/.*$/.test(item.link)) {
                    const detail = await ofetch(item.link, {
                        headers: {
                            Referer: config.link,
                            Cookie: cookie,
                        },
                    });
                    const content = load(detail);
                    content('.ad-wrap').remove();

                    item.description = content('.article-detail').html();
                    item.author = content('.article-box__meta .item').first().text();
                } else if (/^https?:\/\/gitee\.com\/.*$/.test(item.link)) {
                    const detail = await ofetch(item.link, {
                        headers: {
                            Referer: config.link,
                        },
                    });
                    const content = load(detail);

                    item.description = content('.file_content').html();
                } else if (/^https?:\/\/osc\.cool\/.*$/.test(item.link)) {
                    return fetchArticle(item.link, true);
                }
                return item;
            })
        )
    );

    return {
        title: `开源中国-${config.name}`,
        link: config.link,
        item: resultItem,
    };
}
