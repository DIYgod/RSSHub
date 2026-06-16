import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: ['/search/:keyword/:preview?', '/:type?/:preview?'],
    categories: ['multimedia'],
    example: '/u3c3/search/新片速递',
    parameters: { keyword: 'Search keyword', preview: 'Show image preview, off by default, non empty value means on' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['storytellerF'],
    handler,
};

async function handler(ctx) {
    const { type, keyword, preview } = ctx.req.param();
    // should be:
    // undefined
    // U3C3
    // Videos
    // Photo
    // Book
    // Game
    // Software
    // Other
    const rootURL = 'https://www.u3c3.com';
    let currentURL;
    let title;
    if (keyword) {
        // u3c3 search needs an anti-scrape token: its search box (search21() JS on the
        // homepage) redirects to /?search2=<token>&search=<kw>. The token rotates and is
        // embedded in the page, so scrape it live; hitting /?search=<kw> alone silently
        // returns the homepage listing (the long-standing "always 國產原创" bug).
        const { data: home } = await got(rootURL);
        const varName = home.match(/search2="\s*\+\s*(\w+)/)?.[1];
        const token = varName ? home.match(new RegExp(String.raw`(?<!/)\bvar\s+${varName}\s*=\s*"([^"]+)"`))?.[1] : undefined;
        currentURL = token ? `${rootURL}/?search2=${token}&search=${encodeURIComponent(keyword)}` : `${rootURL}/?search=${encodeURIComponent(keyword)}`;
        title = `search ${keyword} - u3c3`;
    } else if (type === undefined) {
        currentURL = rootURL;
        title = 'home - u3c3';
    } else {
        currentURL = `${rootURL}/?type=${type}&p=1`;
        title = `${type} - u3c3`;
    }

    const response = await got(currentURL);
    const $ = load(response.data);

    const list = $('body > div.container > div.table-responsive > table > tbody > tr')
        .toArray()
        // Skip u3c3's sticky promo rows that appear on every page (home AND search):
        // category-nav rows (href="/?type=…") and external ad rows (href="http://…",
        // e.g. the "國產原创" entries). Real torrent rows always link to /view.
        .filter((el) => $(el).find('td:nth-of-type(2) > a').attr('href')?.startsWith('/view'))
        .map((el) => {
            const item = $(el);
            const a = item.find('td:nth-of-type(2) > a');
            const guid = rootURL + a.attr('href');
            return {
                title: a.attr('title'),
                guid,
                link: guid,
                pubDate: item.find('td:nth-of-type(5)').text(),
                enclosure_url: item.find('td:nth-of-type(3) > a:nth-of-type(2)').attr('href'),
                enclosure_type: 'application/x-bittorrent',
            };
        });

    const items = preview
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link, async () => {
                      const { data: response } = await got(item.link);
                      const $ = load(response);

                      item.description = $('div.panel-footer > img:first-child').parent().html();

                      return item;
                  })
              )
          )
        : list;

    return {
        title,
        description: title,
        link: currentURL,
        item: items,
    };
}
