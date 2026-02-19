import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'http://www.mofcom.gov.cn';

export const route: Route = {
    path: '/mofcom/article/:suffix{.+}',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const suffix = ctx.req.param('suffix');
    const url = `http://www.mofcom.gov.cn/article/${suffix}/`;
    const { data: res } = await got(url);
    const $ = load(res);
    $('.listline').remove();
    const list = $('.txtList_01 li')
        .toArray()
        .map((item) => {
            item = $(item);
            const date =
                item.find('span').length === 0
                    ? item
                          .find('a')
                          .attr('title')
                          .match(/(\d{4}年\d{1,2}月\d{1,2})/)[1]
                    : item
                          .find('span')
                          .text()
                          .match(/((\d{4}-\d{2}-\d{2})(\s\d{2}:\d{2}:\d{2})?)/)[1];
            return {
                title: item.find('a').attr('title'),
                link: host + item.find('a').attr('href'),
                pubDate: timezone(parseDate(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'YYYY年M月D']), 8),
            };
        });

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let responses = await got(item.link);
                // xwfb/xwlxfbh || xwfb/xwztfbh
                const redirect = responses.data.match(/_cofing1={href:"(.*)",type/) || responses.data.match(/window\.location\.href='(.*)'/);
                if (redirect) {
                    responses = await got(redirect[1], {
                        headers: {
                            Referer: item.link,
                        },
                    });
                }
                const $ = load(responses.data);
                const iframe = $('.art-con iframe').attr('src');
                if ($('.art-con iframe').attr('src')) {
                    const { data: res } = await got(iframe);
                    item.description = load(res)('tbody').html();
                } else {
                    item.description = $('.art-con').html() || /* xwfb/xwztfbh */ $('.textlive').html();
                }
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content'), 'YYYY-MM-DD HH:mm'), 8) : item.pubDate;

                return item;
            })
        )
    );
    return {
        title: $('head > title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: list,
    };
}
