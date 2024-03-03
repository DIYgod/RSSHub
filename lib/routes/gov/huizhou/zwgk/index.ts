// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://www.huizhou.gov.cn';

export default async (ctx) => {
    const cate = ctx.req.param('category') ?? 'zwyw';
    const url = `${rootURL}/zwgk/hzsz/${cate}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('span#navigation').children('a').last().text();
    const list = $('ul.ul_art_row')
        .map((_, item) => ({
            title: $(item).find('a').text().trim(),
            link: $(item).find('a').attr('href'),
            pubDate: timezone(parseDate($(item).find('li.li_art_date').text().trim()), +8),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                try {
                    item.description = content('div.artContent').html();
                    item.author = content('div.info_fbt')
                        .find('span.ly')
                        .text()
                        .match(/来源：(.*)/)[1];
                    item.pubDate = timezone(
                        parseDate(
                            content('div.info_fbt')
                                .find('span.time')
                                .text()
                                .match(/时间：(.*)/)[1]
                        ),
                        +8
                    );
                } catch {
                    item.description = '';
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `惠州市人民政府 - ${title}`,
        link: url,
        item: items,
    });
};
