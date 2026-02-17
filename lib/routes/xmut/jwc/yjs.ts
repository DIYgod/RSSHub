import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const xmut = 'https://yjs.xmut.edu.cn';

export const route: Route = {
    path: '/jwc/yjjw/:category?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'yjsc' } = ctx.req.param();
    const url = `${xmut}/index/${category}.htm`;
    const res = await got(url, {
        headers: {
            referer: xmut,
        },
    });
    const $ = load(res.data);
    const items = $('.mainWrap .main_con .main_conR ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('em').text(),
                link: `${xmut}/` + item.find('a').attr('href'),
                pubDate: parseDate(item.find('span').text()),
            };
        });
    const itemPromises = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: xmut,
                    },
                });
                const $item = load(detailResponse.data);
                const content = $item('body .mainWrap .main_content .v_news_content').html();
                item.description = content;
                return item;
            })
        )
    );
    return {
        title: $('title').text(),
        link: url,
        item: itemPromises,
    };
}
