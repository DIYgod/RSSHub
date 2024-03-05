// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
const host = 'https://www.flyert.com';
const target = `${host}/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322`;

export default async (ctx) => {
    const response = await got(target, {
        responseType: 'buffer',
    });

    const $ = load(gbk2utf8(response.data));
    const list = $('.comiis_wzli')
        .map((_index, item) => ({
            title: $(item).find('.wzbt').text(),
            link: `${host}/${$(item).find('.wzbt a').attr('href')}`,
            description: $(item).find('.wznr > div:first-child').text(),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });
                const content = load(gbk2utf8(detailResponse.data));

                // remove top ad
                content('div.artical_top').remove();

                item.description = content('#artMain').html();
                item.pubDate = timezone(parseDate(content('p.xg1 > span:nth-child(1)').attr('title') || content('p.xg1').text().split('|')[0], 'YYYY-M-D HH:mm'), +8);
                return item;
            })
        )
    );
    ctx.set('data', {
        title: '飞客茶馆优惠',
        link: 'https://www.flyert.com/',
        description: '飞客茶馆优惠',
        item: items,
    });
};
