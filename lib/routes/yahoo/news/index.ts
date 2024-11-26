import { Route } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { getArchive, getCategories, parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/:region/:category?',
    categories: ['new-media', 'popular'],
    example: '/yahoo/news/hk/world',
    parameters: {
        region: 'Region, `hk/tw/au/ca/fr/malaysia/nz/sg/uk/en(us)`, the part represented by the asterisk (*) in *.news.yahoo.com',
        category: 'Category, The part represented by the asterisk (*) in .news.yahoo.com/rss/*, region "hk/tw" differs, see the description below',
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
            source: ['news.yahoo.com/'],
        },
    ],
    name: 'News',
    maintainers: ['KeiLongW', 'williamgateszhao'],
    handler,
    url: 'news.yahoo.com/',
    description: `
\`Region\`

Support all regions represented by the asterisk (*) in *.news.yahoo.com, such as hk/tw/au/ca/fr/malaysia/nz/sg/uk/en(us). For www.yahoo.com, use en or us. Sites with news domains other than *.news.yahoo.com, such as de.nachrichten.yahoo.com or news.yahoo.co.jp, are not supported.

\`Category\`

The parsing method for Yahoo Hong Kong and Taiwan is quite unique. All supported categories are as follows

Category for hk.news.yahoo.com (hongkong)

| 全部     | 港聞      | 兩岸國際 | 財經      | 娛樂          | 體育   | 健康   | 親子       | 副刊       |
| ------- | --------- | -------- | -------- | ------------- | ------ | ------ | --------- | ---------- |
| (empty) | hong-kong | world    | business | entertainment | sports | health | parenting | supplement |

Category for tw.news.yahoo.com (taiwan)

| 全部     | 政治     | 財經    | 娛樂          | 運動    | 社會地方 | 國際   | 生活      | 健康   | 科技        | 品味  |
| ------- | -------- | ------- | ------------- | ------ | -------- | ----- | --------- | ------ | ---------- | ----- |
| (empty) | politics | finance | entertainment | sports | society  | world | lifestyle | health | technology | style |

Other Yahoo news is fetched from the RSS provided by Yahoo. Please refer to the categories displayed on the pages of *.news.yahoo.com (for example, "world"), and try to access *.news.yahoo.com/rss/world to see if it is accessible and contains recent news (some categories exist but are not updated). If it is accessible and has recent news, then that category can be used on the corresponding site. For example, the available categories for news.yahoo.com are as follows

Category for news.yahoo.com (US)

| All     | US | Politics | World | Science | Tech |
| ------- | -- | -------- | ----- | ------- | ---- |
| (empty) | us | politics | world | science | tech |

To give another example, since uk.news.yahoo.com/rss/ukoriginal is accessible and has recent news, /yahoo/news/uk/ukoriginal is a valid RSSHub route.

\`author\`

For Yahoo Hong Kong and Yahoo Taiwan, please use another "news source" route.

For other Yahoo News, this route's RSS provides the author field. You can use RSSHub's built-in "content filtering" feature. For example, /yahoo-wg/news/tw/technology?filter_author=Yahoo%20Tech|Engadget can filter out news with authors containing Yahoo Tech or Engadget from Yahoo Taiwan's technology news, which is the Chinese version of Engadget.
`,

    zh: {
        name: '新闻',
        description: `
\`区域 Region\`

支持所有 *.news.yahoo.com 中*号所代表的区域, 例如\`hk/tw/au/ca/fr/malaysia/nz/sg/uk/en(us)\`, 其中 www.yahoo.com 用 en 或 us 来表示。不支持新闻域名不为 *.news.yahoo.com 的站点如 de.nachrichten.yahoo.com 或 news.yahoo.co.jp。

\`分类 Category\`

香港和台湾雅虎的读取方式比较特别, 所有支持的 category 如下

hk.news.yahoo.com (香港) 所支持的分类

| 全部     | 港聞      | 兩岸國際 | 財經      | 娛樂          | 體育   | 健康   | 親子       | 副刊       |
| ------- | --------- | -------- | -------- | ------------- | ------ | ------ | --------- | ---------- |
| （留空） | hong-kong | world    | business | entertainment | sports | health | parenting | supplement |

tw.news.yahoo.com (台湾) 所支持的分类

| 全部     | 政治     | 財經    | 娛樂          | 運動    | 社會地方 | 國際   | 生活      | 健康   | 科技        | 品味  |
| ------- | -------- | ------- | ------------- | ------ | -------- | ----- | --------- | ------ | ---------- | ----- |
| （留空） | politics | finance | entertainment | sports | society  | world | lifestyle | health | technology | style |

其他雅虎新闻读取自 yahoo 提供的 RSS, 请根据 *.news.yahoo.com 的页面上展示的分类(例如 world ), 尝试 *.news.yahoo.com/rss/world 能否访问并且有近期的新闻(有些分类存在但未更新), 如果可以的话则该分类可以用在相应站点, 例如 news.yahoo.com 可用的分类如下

news.yahoo.com (美国) 所支持的分类

| All     | US | Politics | World | Science | Tech |
| ------- | -- | -------- | ----- | ------- | ---- |
| (留空)  | us | politics | world | science | tech |

再举例, 由于 uk.news.yahoo.com/rss/ukoriginal 可以访问并且有较新的新闻, 所以 /yahoo/news/uk/ukoriginal 是一个有效的RSSHub路由。

\`作者 author\`

对于香港和台湾雅虎, 请使用另一个"新聞來源"路由。

对于其他雅虎新闻, 本路由的 RSS 中提供了 author 字段, 可使用 RSSHub 的内置"内容过滤"功能, 例如 /yahoo-wg/news/tw/technology?filter_author=Yahoo%20Tech|Engadget 可从台湾雅虎的科技新闻中过滤出作者名称中包含 Yahoo Tech 或者 Engadget 的新闻, 即瘾科技中文版。
`,
    },
};

async function handler(ctx) {
    const region = ['en', 'EN', 'us', 'US', 'www', 'WWW', ''].includes(ctx.req.param('region')) ? '' : ctx.req.param('region').toLowerCase();
    const category = ctx.req.param('category');
    if (!['hk', 'tw', 'au', 'ca', 'fr', 'malaysia', 'nz', 'sg', 'uk', ''].includes(region)) {
        throw new InvalidParameterError(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    if (['hk', 'tw'].includes(region)) {
        const categoryMap = await getCategories(region, cache.tryGet);
        const tag = category ? categoryMap[category].yctMap : null;

        const response = await getArchive(region, limit, tag);
        const list = parseList(region, response);

        const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

        return {
            title: `Yahoo 新聞 ${region.toUpperCase()} - ${category ? categoryMap[category].name : '所有類別'}`,
            link: `https://${region}.news.yahoo.com/${category ? `${category}/` : ''}archive`,
            image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
            item: items,
        };
    } else {
        const rssUrl = `https://${region ? `${region}.` : ''}news.yahoo.com/rss/${category ? `${category}/` : ''}`;
        const feed = await parser.parseURL(rssUrl);
        const filteredItems = feed.items.filter((item) => item?.link && !item.link.includes('promotions') && new URL(item.link).hostname.match(/.*\.yahoo\.com$/));
        const items = await Promise.all(filteredItems.map((item) => parseItem(item, cache.tryGet)));

        return {
            title: `Yahoo News ${region.toUpperCase()} - ${category ? category.toUpperCase() : 'All'}`,
            link: feed.link,
            description: feed.description,
            item: items,
        };
    }
}
