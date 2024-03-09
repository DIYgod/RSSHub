import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news/:language?/:category?',
    categories: ['game'],
    example: '/blizzard/news',
    parameters: { language: 'Language code, see below, en-US by default', category: 'Category, see below, All News by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `Categories

  | Category               | Slug                |
  | ---------------------- | ------------------- |
  | All News               |                     |
  | Diablo II: Resurrected | diablo2             |
  | Diablo III             | diablo3             |
  | Diablo IV              | diablo4             |
  | Diablo: Immortal       | diablo-immortal     |
  | Hearthstone            | hearthstone         |
  | Heroes of the Storm    | heroes-of-the-storm |
  | Overwatch 2            | overwatch           |
  | StarCraft: Remastered  | starcraft           |
  | StarCraft II           | starcraft2          |
  | World of Warcraft      | world-of-warcraft   |
  | Warcraft III: Reforged | warcraft3           |
  | Battle.net             | battlenet           |
  | BlizzCon               | blizzcon            |
  | Inside Blizzard        | blizzard            |

  Language codes

  | Language           | Code  |
  | ------------------ | ----- |
  | Deutsch            | de-de |
  | English (US)       | en-us |
  | English (EU)       | en-gb |
  | Español (EU)       | es-es |
  | Español (Latino)   | es-mx |
  | Français           | fr-fr |
  | Italiano           | it-it |
  | Português (Brasil) | pt-br |
  | Polski             | pl-pl |
  | Русский            | ru-ru |
  | 한국어             | ko-kr |
  | ภาษาไทย            | th-th |
  | 日本語             | ja-jp |
  | 繁體中文           | zh-tw |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || '';
    const language = ctx.req.param('language') || 'en-us';

    const rootUrl = 'https://news.blizzard.com';
    const currentUrl = `${rootUrl}/${language}/${category}`;
    const apiUrl = `${rootUrl}/${language}/blog/list`;
    const response = await got(apiUrl, {
        searchParams: {
            community: category === '' ? 'all' : category,
        },
    });

    const $ = load(response.data.html, null, false);

    const list = $('.FeaturedArticle-text > a, .ArticleListItem > article > a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.author = content('.ArticleDetail-bylineAuthor').text();
                item.description = content('.ArticleDetail-headingImageBlock').html() + content('.ArticleDetail-content').html();
                item.pubDate = content('.ArticleDetail-subHeadingLeft time').attr('timestamp');

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
