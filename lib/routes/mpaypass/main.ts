// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const { type = '' } = ctx.req.param();
    const title_url = type ? `http://www.mpaypass.com.cn/${type}.html` : 'http://www.mpaypass.com.cn';

    const response = await got({
        method: 'get',
        url: title_url,
    });

    const data = response.data;

    const $ = load(data);

    const title_cn = type ? $(`a[href="http://www.mpaypass.com.cn/${type}.html"]`).text() : '最新文章';
    const list = $('.newslist')
        .map(function () {
            const info = {
                title: $(this).find('#title').text(),
                link: $(this).find('#title').find('a').attr('href'),
                time: $(this).find('#time').text(),
                category: $(this)
                    .find('#keywords')
                    .find('a')
                    .toArray()
                    .map((e) => $(e).text().trim()),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await got(info.link);
                const $ = load(response.data);
                const newsbody = $('div.newsbody').html();

                return {
                    title: info.title,
                    link: info.link,
                    pubDate: timezone(parseDate(info.time), +8),
                    description: newsbody,
                    category: info.category,
                };
            })
        )
    );

    ctx.set('data', {
        title: `移动支付网-${title_cn}`,
        link: title_url,
        item: out,
    });
};
