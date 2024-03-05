// @ts-nocheck
import cache from '@/utils/cache';
const cherrio = require('cheerio');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://telegram.org/blog';

    const res = await got(link);
    const $$ = cherrio.load(res.body);

    const items = await Promise.all(
        $$('.dev_blog_card_link_wrap')
            .get()
            .map((each) => {
                const $ = $$(each);
                const link = 'https://telegram.org' + $.attr('href');
                return cache.tryGet(link, async () => {
                    const result = await got(link);
                    const $ = cherrio.load(result.body);
                    return {
                        title: $('#dev_page_title').text(),
                        link,
                        pubDate: parseDate($('[property="article:published_time"]').attr('content')),
                        description: $('#dev_page_content_wrap').html(),
                    };
                });
            })
    );

    ctx.set('data', {
        title: $$('title').text(),
        link,
        item: items,
    });
};
