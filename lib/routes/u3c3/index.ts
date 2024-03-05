// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const { type, keywoard, preview } = ctx.req.param();
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
    if (keywoard) {
        currentURL = `${rootURL}/?search=${keywoard}`;
        title = `search ${keywoard} - u3c3`;
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
        .map((item) => {
            item = $(item);
            const title = item.find('td:nth-of-type(2) > a ').attr('title');
            const guid = rootURL + item.find('td:nth-of-type(2) > a').attr('href');
            const link = guid;
            const pubDate = item.find('td:nth-of-type(5)').text();
            const enclosure_url = item.find('td:nth-of-type(3) > a:nth-of-type(2)').attr('href');
            return {
                title,
                guid,
                link,
                pubDate,

                enclosure_url,
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

    ctx.set('data', {
        title,
        description: title,
        link: currentURL,
        item: items,
    });
};
