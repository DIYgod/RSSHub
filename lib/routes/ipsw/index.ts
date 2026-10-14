import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://ipsw.me/';

export const route: Route = {
    path: '/index/:ptype/:pname',
    categories: ['program-update'],
    example: '/ipsw/index/ipsws/iPad8,11',
    parameters: {
        ptype: 'Fill in ipsws or otas to get different versions of firmware',
        pname: 'Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model',
    },
    name: 'Apple Firmware Update-IPSWs/OTAs version',
    maintainers: ['Jeason0228'],
    handler,
};

function getFirmwareUrl(onclick: string | undefined) {
    const path = onclick?.match(/window\.location(?:\.href)?\s*=\s*(['"])(.*?)\1/)?.[2];
    if (!path) {
        throw new Error('IPSW.me did not provide a firmware download link.');
    }
    return new URL(path, host).href;
}

function parseReleaseDate(text: string) {
    if (!text) {
        return;
    }
    const date = parseDate(text.replaceAll(/(\d+)(?:st|nd|rd|th)\b/g, '$1'), ['MMMM D, YYYY', 'D MMM YYYY', 'D MMMM YYYY']);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 0);
}

async function handler(ctx) {
    const { pname, ptype } = ctx.req.param();
    let link = `https://ipsw.me/product/${pname}`;
    if (pname.includes(',')) {
        // console.log('具体产品');
        if (ptype === 'otas') {
            // console.log('otas');
            link = `https://ipsw.me/${ptype}/${pname}`;
        } else if (ptype === 'ipsws') {
            // console.log('ipsw');
            link = `https://ipsw.me/${pname}`;
        }
    } else {
        // console.log('产品线');
        link = `https://ipsw.me/product/${pname}`;
    }
    // console.log(link);
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    const list = pname.includes(',')
        ? $('.firmware')
              .toArray()
              .map((item) => {
                  const info = {
                      title: $(item).find('td').eq(1).text(),
                      link: getFirmwareUrl($(item).attr('onclick')),
                  };
                  return info;
              })
        : $('.products a')
              .toArray()
              .map((item) => {
                  const link = $(item).attr('href');
                  if (!link) {
                      throw new Error('IPSW.me did not provide a product link.');
                  }
                  const info = {
                      title: $(item).find('img').attr('alt') ?? $(item).text(),
                      link,
                  };
                  return info;
              });

    const out = await pMap(
        list,
        (info) => {
            const title = info.title;
            const itemUrl = new URL(info.link, host).href;

            return cache.tryGet(itemUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                });
                const $ = load(response.data);
                const description = $('div.selector__wizard').html();
                const releaseDate = pname.includes(',') ? $('div.table-responsive table tr').first().find('td').text().trim() : $('tr.firmware').first().find('td').eq(2).text();
                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: parseReleaseDate(releaseDate),
                    guid: title,
                };
            });
        },
        { concurrency: 3 }
    );
    return {
        title: `${pname} - ${ptype} Released`,
        link,
        description: `查看Apple-${pname}- ${ptype} 固件-是否关闭验证`,
        item: out,
    };
}
