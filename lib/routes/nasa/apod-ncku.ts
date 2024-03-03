// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const rootUrl = 'http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/archivepix.html';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    const list = $('body > b > a')
        .slice(0, limit)
        .map((_, el) => ({
            title: $(el).text(),
            link: `http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/${$(el).attr('href')}`,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const description = `<img src="${content('img').attr('src')}"> <br> ${content('body > center').eq(1).html()} <br> ${content('body > p').eq(0).html()}`;
                const pubDate = parseDate(item.link.slice(-11, -5), 'YYMMDD');

                const single = {
                    title: item.title,
                    description,
                    pubDate,
                    link: item.link,
                };
                return single;
            })
        )
    );

    ctx.set('data', {
        title: 'NASA 每日一天文圖 (成大物理分站) ',
        link: rootUrl,
        item: items,
    });
};
