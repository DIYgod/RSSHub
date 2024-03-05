// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseTitle = 'NUIST ESE（南信大环科院）';
const baseUrl = 'https://sese.nuist.edu.cn';

export default async (ctx) => {
    const { category = 'tzgg1' } = ctx.req.param();
    const link = `${baseUrl}/${category}.htm`;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('#ctl00_ctl00_mainbody_rightbody_listcontent_NewsList .gridline')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').eq(1).text(),
                link: new URL(item.find('a').eq(1).attr('href'), baseUrl).href,
                category: item.find('a').eq(0).text(),
                pubDate: parseDate($(item).find('.gridlinedate').text(), 'YYYY年MM月DD日'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('#vsb_content_6').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: baseTitle + '：' + $('.lmtitle').text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    });
};
