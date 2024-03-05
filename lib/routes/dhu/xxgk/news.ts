// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://xxgk.dhu.edu.cn/1737/list.htm';

export default async (ctx) => {
    const link = base_url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: base_url,
        },
    });

    const $ = load(response.data);
    ctx.set('data', {
        link: base_url,
        title: '东华大学信息公开网-最新公开信息',
        item: $('.cols')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.cols_meta', elem).text()), +8),
            }))
            .get(),
    });
};
