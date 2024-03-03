// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import queryString from 'query-string';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const tid = ctx.req.param('tid');
    const cookieString = config.saraba1st.cookie ?? '';

    const res = await got('https://bbs.saraba1st.com/2b/forum.php', {
        searchParams: queryString.stringify({
            mod: 'viewthread',
            tid,
            ordertype: 1,
        }),
        headers: {
            Cookie: cookieString,
        },
    });

    const $ = load(res.data);
    const title = $('#thread_subject').text();

    const list = $('#postlist > div[id^=post_]:not(:first-of-type)');
    const count = [];

    for (let i = 0; i < Math.min(list.length, 20); i++) {
        count.push(i);
    }
    const resultItems = count.map((i) => {
        const each = $(list[i]);
        const floor = each.find('td.plc .pi a > em').text();
        const floorUrl = each.find('td.plc .pi a').attr('href');
        const contentHtml = $(each.find('td.t_f'));
        const imgsHtml = contentHtml.find('img');
        for (const element of imgsHtml) {
            if (element.attribs.src === 'https://static.saraba1st.com/image/common/none.gif') {
                element.attribs.src = element.attribs.file;
                const imgHtml = $(element);
                imgHtml.removeAttr('zoomfile');
                imgHtml.removeAttr('file');
                imgHtml.removeAttr('onmouseover');
                imgHtml.removeAttr('onclick');
            }
        }
        contentHtml.find('div.aimg_tip').remove();
        return {
            title: `${title} #${floor}`,
            link: new URL(floorUrl, 'https://bbs.saraba1st.com/2b/').href,
            description: contentHtml.html(),
            author: each.find('.authi .xw1').text(),
            pubDate: timezone(parseDate(each.find('.authi em').text()), +8),
        };
    });

    ctx.set('data', {
        title: `Stage1 论坛 - ${title}`,
        link: `https://bbs.saraba1st.com/2b/thread-${tid}-1-1.html`,
        item: resultItems,
    });
};
