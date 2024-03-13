import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const sub = ctx.req.param('sub');
    const rootUrl = 'https://uic.edu.cn/news/' + sub + '.htm';

    const response = await got.get(rootUrl);
    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('div.youtx > ul > li')
            .map(async (_, item) => {
                const link = 'https://uic.edu.cn/' + $(item).find('a').attr('href');
                const page = await got.get(link);
                const $$ = cheerio.load(page.data);
                const description = $$('div.v_news_content').html();
                const dateText = $$('span.nry_data').text().trim();
                const pubDate = parseDate(dateText.split('：')[1], 'YYYY-MM-DD');
                return {
                    title: $(item).find('a').text(),
                    link,
                    description,
                    pubDate,
                };
            })
            .get()
    );
    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    });
};
