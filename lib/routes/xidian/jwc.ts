// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://jwc.xidian.edu.cn';

export default async (ctx) => {
    const { category = 'tzgg' } = ctx.req.param();
    const url = `${baseUrl}/${category}.htm`;
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.data);

    let items = $('.list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.con span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = load(detailResponse.data);
                content('.tit, .zd, #div_vote_id').remove();
                item.description = content('.con').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: items,
    });
};
