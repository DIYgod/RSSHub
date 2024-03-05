// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const link = `https://www.cnblogs.com${getSubPath(ctx)}`;
    const response = await got(link);
    const data = response.data;

    const $ = load(data);
    const list = $('#post_list article')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.post-item-title').text(),
                link: item.find('.post-item-title').attr('href'),
                pubDate: timezone(parseDate(item.find('.post-item-foot .post-meta-item span').text() || item.find('.editorpick-item-meta').text(), ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD']), +8),
                description: item.find('.post-item-summary').text(),
                author: item.find('.post-item-author span').text(),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link,
        item: list,
    });
};
