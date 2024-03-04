// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const iconv = require('iconv-lite');

const rootUrl = 'http://news.inewsweek.cn';

export default async (ctx) => {
    const channel = ctx.req.param('channel');
    const url = `${rootUrl}/${channel}`;
    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const items = await Promise.all(
        $('div.grid-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const href = item.find('a').attr('href');
                const articleLink = `${rootUrl}${href}`;
                return cache.tryGet(articleLink, async () => {
                    const response = await got(articleLink, {
                        responseType: 'buffer',
                    });

                    const $ = load(iconv.decode(response.data, 'gbk'));
                    const fullText = $('div.contenttxt').html();
                    const time = timezone(
                        parseDate(
                            $('div.editor')
                                .html()
                                .split(/(\s\s+)/)[2]
                        ),
                        +8
                    );
                    return {
                        title: item.find('p').text(),
                        description: fullText,
                        link: articleLink,
                        pubDate: time,
                    };
                });
            })
    );

    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: items,
    });
};
