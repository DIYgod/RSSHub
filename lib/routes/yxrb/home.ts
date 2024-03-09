import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'http://news.yxrb.net';

export default async (ctx) => {
    const { category = 'info' } = ctx.req.param();
    const link = `${baseUrl}/${category}/`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.channel-news .item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.title a').attr('title'),
                link: `${baseUrl}${item.find('.title a').attr('href')}`,
                author: item.find('.author a').text().split('作者 : ')[1],
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = item.author ?? $('.author-info .name a').text().split('作者 : ')[1];
                item.pubDate = timezone(
                    parseDate(
                        $('.publish-time')
                            .first()
                            .contents()
                            .filter((_, e) => e.nodeType === 3)
                            .text()
                            .trim(),
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                    8
                );
                item.description = $('article').html();
                item.category = $('.tags a')
                    .toArray()
                    .map((item) => $(item).text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name=description]').attr('content'),
        link,
        image: $('.channel-img img').attr('src'),
        item: items,
    });
};
