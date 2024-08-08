import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:site?/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { site = 'www' } = ctx.req.param();
    let { category = site === 'www' ? '59476' : '' } = ctx.req.param();
    category = site === 'cpc' && category === '24h' ? '87228' : category;

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }
    const rootUrl = `http://${site}.people.com.cn`;
    const currentUrl = new URL(`GB/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const encoding = site === 'www' ? 'gbk' : 'utf-8';
    const decodedResponse = iconv.decode(response, encoding);
    const $ = load(decodedResponse);

    $('em').remove();
    $('.bshare-more, .page_n, .page').remove();

    $('a img, h3 img').each((_, e) => {
        $(e).parent().remove();
    });

    let items = $('.p6, div.p2j_list, div.headingNews, div.ej_list_box, .fl, .leftItem')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href').trim();

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : new URL(link.replace(/^\.\./, ''), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const data = iconv.decode(detailResponse, encoding);
                    const content = load(data);

                    content('.paper_num, #rwb_tjyd').remove();

                    item.description = content('.rm_txt_con, .show_text').html();
                    item.pubDate = timezone(parseDate(data.match(/(\d{4}年\d{2}月\d{2}日\d{2}:\d{2})/)[1], 'YYYY年MM月DD日 HH:mm'), +8);
                } catch (error) {
                    item.description = error;
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
