// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

async function loadContent(link) {
    const res = await got(link);
    const content = load(res.data);
    return content;
}

export default async (ctx) => {
    const topic = ctx.req.param('topic');
    const topicUrl = `https://www.oschina.net/question/topic/${topic}?show=time`;

    const $ = await loadContent(topicUrl);
    const topicName = $('.topic-info > .topic-header > h3').text();
    const list = $('#questionList .question-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: item.find('.header').text(),
                description: item.find('.description').html(),
                link: item.find('.header').attr('href'),
                author: item.find('.extra > .list > .item:nth-of-type(1)').text(),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const content = await loadContent(item.link);
                    content('.ad-wrap').remove();
                    item.description = content('#articleContent').html();
                } catch {
                    // 403
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `开源中国-${topicName}`,
        description: $('.topic-introduction').text(),
        link: topicUrl,
        item: resultItem,
    });
};
