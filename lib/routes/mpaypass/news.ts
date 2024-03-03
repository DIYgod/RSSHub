// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const link = 'http://m.mpaypass.com.cn';
    const listData = await got(link);
    const $list = load(listData.data);
    ctx.set('data', {
        title: '新闻 - 移动支付网',
        link,
        language: 'zh-CN',
        item: await Promise.all(
            $list('.Newslist-li')
                .map((_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('.Newslist-title a');
                    const href = $a.attr('href');
                    const title = $a.text();
                    const date = $el.find('.Newslist-time span').text();

                    return cache.tryGet(href, async () => {
                        const contentData = await got.get(href);
                        const $content = load(contentData.data);
                        const description = $content('.newslist-body').html();

                        return {
                            title,
                            description,
                            link: href,
                            pubDate: timezone(parseDate(date), +8),
                        };
                    });
                })
                .get()
        ),
    });
};
