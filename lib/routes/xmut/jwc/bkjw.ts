import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const xmut = 'https://jwc.xmut.edu.cn';

export const route: Route = {
    path: '/jwc/bkjw/:category?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'jwxt' } = ctx.req.param();
    const url = `${xmut}/index/tzgg/${category}.htm`;
    const res = await got(url, {
        headers: {
            referer: xmut,
        },
    });
    const $ = load(res.data);
    const itemsArray = $('#result_list table tbody tr')
        .toArray()
        .map((row) => {
            const res = $('td', row).eq(0);
            const resDate = $('td', row).eq(1);
            const resLink = $('a', res).attr('href');
            let link;
            if (resLink.startsWith('../../')) {
                const parsedUrl = new URL(resLink, xmut);
                link = parsedUrl.href;
            } else {
                link = resLink;
            }
            const title = $('a', res).attr('title');
            const pubDate = parseDate(resDate.text().trim());
            return {
                title,
                link,
                pubDate,
            };
        });
    const items = await Promise.all(
        itemsArray.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got(item.link, {
                    headers: {
                        referer: xmut,
                    },
                });
                const $item = load(res.data);
                const content = $item('table #result #content form div #vsb_content_6').html();
                item.description = content;
                return item;
            })
        )
    );
    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
