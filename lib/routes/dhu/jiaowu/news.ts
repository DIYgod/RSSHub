// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://jw.dhu.edu.cn';

const map = {
    student: '/tzggwxszl/list.htm',
    teacher: '/tzggwjszl/list.htm',
};
export default async (ctx) => {
    const type = ctx.req.param('type');
    const link = Object.hasOwn(map, type) ? `${base_url}${map[type]}` : `${base_url}/tzggwxszl/list.htm`;
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
        title: '东华大学教务处-' + $('.col_title').text(),
        item: $('.list_item')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.Article_PublishDate', elem).text()), +8),
            }))
            .get(),
    });
};
