import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:region?/:category{.+}?',
    categories: ['new-media'],
    example: '/kantarworldpanel/cn-en/news',
    parameters: { region: 'Region id, see below, Chinese Mainland English by default', category: 'Category, can be found in URL, News by default' },
    name: 'News Centre',
    maintainers: ['nczitzk'],
    handler,
    description: `| Region      | id    |
| ----------- | ----- |
| China Eng   | cn-en |
| China 中文  | cn    |
| Indonesia   | id    |
| Korea       | kr    |
| Malaysia    | my    |
| Philippines | ph    |
| Taiwan      | tw    |
| Thailand    | th    |
| Vietnam     | vn    |

<details>
  <summary>More categories</summary>

#### China Eng

| News | Retail Snapshot | Publications         | In the media |
| ---- | --------------- | -------------------- | ------------ |
| news | publications    | publications/Reports | In-the-media |

#### China 中文

| 新闻发布 | 零售市场快报 | 市场报告                    | 媒体报道       |
| -------- | ------------ | --------------------------- | -------------- |
| news     | publications | publications/China-Insights | press-releases |

#### Indonesia

| News | Kantar Scoop                  | Video Series      | Podcast      | Ready, Steady, Shop!     | Asia Pulse      |
| ---- | ----------------------------- | ----------------- | ------------ | ------------------------ | --------------- |
| News | News/Kantar-Worldpanel-Series | News/video-series | News/podcast | News/asia-shopper-series | News/Asia-Pulse |

#### Korea

| News | Insight Reports | In the Media   |
| ---- | --------------- | -------------- |
| news | publications    | press-releases |

#### Malaysia

| News |
| ---- |
| news |

#### Philippines

| Latest Insights | In the Media | Events |
| --------------- | ------------ | ------ |
| Latest-Insights | In-the-Media | events |

#### Taiwan

| 聚焦台灣                 | WOW SPOT     | 市場報告     | 媒體報導       | 活動   |
| ------------------------ | ------------ | ------------ | -------------- | ------ |
| news/spotlight-on-taiwan | news/wowspot | publications | press-releases | events |

#### Thailand

| News |
| ---- |
| news |

#### Vietnam

| Insights | FMCG Monitor      | Ready, Steady, Shop!   | Asia Pulse      | IN THE MEDIA |
| -------- | ----------------- | ---------------------- | --------------- | ------------ |
| news     | news/FMCG-Monitor | news/ready-steady-shop | news/asia-pulse | In-the-media |

</details>`,
};

async function handler(ctx) {
    const { region = 'cn-en', category = 'news' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.kantarworldpanel.com/';
    const currentUrl = `${rootUrl}${region}/${category}`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.slide, #newssource')
        .find('li')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');
            const image = $item.find('img');

            const title = $item.find('h3.mediumFont').text();

            let link = a.prop('href');
            link = link === '#' ? currentUrl : link;

            const description = $item.find('p.gowhite').text();
            const imageSrc = image.prop('src');
            return {
                title,
                link,
                description: renderToString(
                    <>
                        {description || undefined}
                        {imageSrc ? (
                            <figure>
                                <img src={imageSrc} />
                            </figure>
                        ) : null}
                    </>
                ),
                guid: link!.startsWith(rootUrl) ? `${link}#${title}` : link,
                pubDate: parseDate($item.find('p.medGrey').text(), 'DD/MM/YYYY'),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            // Passthrough cards retain their individual list metadata.
            if (item.link === currentUrl || !item.link!.startsWith(rootUrl)) {
                return item;
            }
            if (/dwl\.php/.test(item.link!)) {
                return { ...item, enclosure_url: item.link, enclosure_type: 'application/pdf' };
            }
            const detail = await cache.tryGet(`kantarworldpanel:detail:${item.link}`, async () => {
                const detailResponse = await ofetch.raw<string, 'text'>(item.link!, { responseType: 'text' });
                if (!detailResponse.url.startsWith(rootUrl)) {
                    return;
                }
                const content = load(detailResponse._data!);
                return {
                    title: content('h1.newshead').text(),
                    description: content('div.center-content div.left-layout-col').html() ?? '',
                    category: content('meta[name="keywords"]').prop('content')?.split(/,\s?/) ?? [],
                    pubDate: parseDate(content('p.newsdateshare').text(), 'DD/MM/YYYY'),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        image: $('#logoprint img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
    };
}
