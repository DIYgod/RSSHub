import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article/:suffix{.+}',
    name: '政务公开',
    example: '/gov/mofcom/article/b',
    parameters: { suffix: '支持形如 `http://www.mofcom.gov.cn/article/*` 的网站，传入 article 之后的后缀' },
    maintainers: ['LogicJake'],
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
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const date =
                $item.find('span').length === 0
                    ? $item
                          .find('a')
                          .attr('title')
                          ?.match(/(\d{4}年\d{1,2}月\d{1,2})/)?.[1]
                    : $item
                          .find('span')
                          .text()
                          .match(/((\d{4}-\d{2}-\d{2})(\s\d{2}:\d{2}:\d{2})?)/)?.[1];
            return {
                title: $item.find('a').attr('title')!,
                link: new URL($item.find('a').attr('href')!, url).href,
                pubDate: date ? timezone(parseDate(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'YYYY年M月D']), 8) : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let detailUrl = item.link;
                let responses = await got(detailUrl);
                // xwfb/xwlxfbh || xwfb/xwztfbh
                const redirect = responses.data.match(/_cofing1=\{href:"(.*)",type/) || responses.data.match(/window\.location\.href='(.*)'/);
                if (redirect) {
                    detailUrl = new URL(redirect[1], detailUrl).href;
                    responses = await got(detailUrl, {
                        headers: {
                            Referer: item.link,
                        },
                    });
                }
                const $ = load(responses.data);
                const iframe = $('.art-con iframe').attr('src');
                if (iframe) {
                    const { data: res } = await got(new URL(iframe, detailUrl).href);
                    item.description = load(res)('tbody').html();
                } else {
                    item.description = $('.art-con').html() || /* xwfb/xwztfbh */ $('.textlive').html();
                }
                const publishedDate = $('meta[name="PubDate"]').attr('content');
                item.pubDate = publishedDate ? timezone(parseDate(publishedDate, 'YYYY-MM-DD HH:mm'), 8) : item.pubDate;

                return item;
            })
        )
    );
    return {
        title: $('head > title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}
