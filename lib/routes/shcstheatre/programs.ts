import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import * as path from 'node:path';

export default async (ctx) => {
    const url = 'https://www.shcstheatre.com/Program/programList.aspx';
    const res = await got.get(url);
    const $ = load(res.data);
    const items = await Promise.all(
        $('#datarow .program-name a').map((_, elem) => {
            const link = new URL($(elem).attr('href'), url);
            return cache.tryGet(link.toString(), async () => {
                const id = link.searchParams.get('id');
                const res2 = await got.post('https://www.shcstheatre.com/webapi.ashx?op=GettblprogramCache', {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    form: { id },
                });
                const data = res2.data.data.tblprogram[0];
                return {
                    title: data.SCS_WEB_BRIEFNAME,
                    link: link.toString(),
                    description: art(path.join(__dirname, 'templates/description.art'), data),
                    pubDate: timezone(parseDate(data.SJ_DATE_PC), +8),
                };
            });
        })
    );
    const image = $('.menu-logo img').attr('src');

    ctx.set('data', {
        title: '上海文化广场 - 节目列表',
        link: url,
        image,
        item: items,
    });
};
