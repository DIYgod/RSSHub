// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `https://bbs.zhibo8.cc/forum/topic?tid=${id}`;

    const response = await got(link);
    const $ = load(response.data);

    const title = $('div.topic-title > h1').text();
    const list = $('.topic-content .topic-table');

    const out = list.toArray().map((item) => {
        item = $(item);
        const author = item.find('.topic-left > div > a').text();
        const floor = item.find('p.topic-foot span:nth-child(2)').text();
        const description = item.find('.detail_ent').html().replaceAll('src="', 'src="https:');
        const pubDate = timezone(
            parseDate(
                item
                    .find('p.topic-foot')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)[0],
                'YYYY-MM-DD HH:mm'
            ),
            +8
        );

        const single = {
            title: `${floor}：${author}发表了新回复`,
            author,
            description,
            link,
            pubDate,
            guid: `zhibo8:post:${id}:${floor}`,
        };

        return single;
    });

    ctx.set('data', {
        title: `“${title}”的新回复—直播吧`,
        link,
        item: out,
    });
};
