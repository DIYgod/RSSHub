// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const response = await got('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const result = response.data.result;

    ctx.set('data', {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: await Promise.all(
            result.map((item) =>
                cache.tryGet(item.url, async () => {
                    const res = await got(item.url);
                    const $ = load(res.data);
                    item.description = $('.eflYNZ #js_content').css('visibility', 'visible').html() ?? $('.bxHoEL').html();
                    return {
                        title: item.title,
                        description: item.description,
                        pubDate: item.date_published,
                        link: item.url,
                        author: item.author.nickname,
                    };
                })
            )
        ),
    });
};
