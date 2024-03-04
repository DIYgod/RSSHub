// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'xwdt';

    const rootUrl = 'https://yjsy.hljucm.net';
    const currentUrl = `${rootUrl}/index/${category}.htm`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.postlist a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                item.description = content('#vsb_newscontent').html();
                item.pubDate = timezone(parseDate(content('.timestyle56043').text()), +8);

                const files = detailResponse.data.match(/<span>附件【<a href="(.*)"><span>(.*)<\/span><\/a>】<\/span>/g);

                if (files) {
                    for (const file of files) {
                        const { link, name } = file.match(/【<a href="(?<link>.*)"><span>(?<name>.*)<\/span><\/a>】/).groups;
                        item.description += `<a href="${link}">${name}</a>`;
                    }
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
