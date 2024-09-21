import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:language?',
    categories: ['programming'],
    example: '/nodejs/blog',
    parameters: { language: 'Language, see below, en by default' },
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
            source: ['nodejs.org/:language/blog', 'nodejs.org/'],
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `| العربية | Catalan | Deutsch | Español | زبان فارسی |
  | ------- | ------- | ------- | ------- | ---------- |
  | ar      | ca      | de      | es      | fa         |

  | Français | Galego | Italiano | 日本語 | 한국어 |
  | -------- | ------ | -------- | ------ | ------ |
  | fr       | gl     | it       | ja     | ko     |

  | Português do Brasil | limba română | Русский | Türkçe | Українська |
  | ------------------- | ------------ | ------- | ------ | ---------- |
  | pt-br               | ro           | ru      | tr     | uk         |

  | 简体中文 | 繁體中文 |
  | -------- | -------- |
  | zh-cn    | zh-tw    |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://nodejs.org';
    const currentUrl = `${rootUrl}/${language}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.summary').remove();

    let items = $('ul.blog-index li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.pubDate = parseDate(content('time').attr('datetime'));
                item.author = content('.blogpost-meta')
                    .text()
                    .match(/by (.*), /)?.[1];

                content('.blogpost-header').remove();

                item.description = content('article').html();

                return item;
            })
        )
    );

    return {
        title: 'News - Node.js',
        link: currentUrl,
        item: items,
    };
}
