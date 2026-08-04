import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = 'https://www.kantarworldpanel.com/';
    const currentUrl = new URL(`${region}/${category}`, rootUrl).href;

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

            const title = $item.find('h3.mediumFont').text().trim();

            let link = a.prop('href');
            link = link === '#' ? currentUrl : link;

            const description = $item.find('p.gowhite').text();
            const imageSrc = image.prop('src');
            return {
                title,
                link,
                description: renderToString(
                    <>
                        {description ? raw(description) : null}
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

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                // The URL similar to the example below is the file download URL.
                // eg. https://www.kantarworldpanel.com/dwl.php?sn=publications&id=1632.
                if (item.link === currentUrl || !item.link!.startsWith(rootUrl)) {
                    return item;
                }
                if (/dwl\.php/.test(item.link!)) {
                    item.enclosure_url = item.link;
                    item.enclosure_type = 'application/pdf';

                    return item;
                }

                const detailResponse = await got(item.link);

                if (!detailResponse.url.startsWith(rootUrl)) {
                    return item;
                }

                const content = load(detailResponse.data);

                item.title = content('h1.newshead').text();
                item.description = content('div.center-content div.left-layout-col').html() ?? '';
                item.category = content('meta[name="keywords"]').prop('content')?.split(/,\s?/) ?? [];
                item.pubDate = parseDate(content('p.newsdateshare').text(), 'DD/MM/YYYY');

                return item;
            })
        )
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
        allowEmpty: true,
    };
}
