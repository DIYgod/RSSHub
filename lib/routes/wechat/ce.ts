// @ts-nocheck
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import got from '@/utils/got';
import { load } from 'cheerio';
import { fixArticleContent } from '@/utils/wechat-mp';
import { parseDate } from '@/utils/parse-date';

// any UA containing "RSS" can pass the check
// mark the UA as a desktop UA with "(X11; Linux x86_64)"
const UA = 'Mozilla/5.0 (X11; Linux x86_64) RSS Reader';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const feed = await parser.parseString(
        await got
            .get(`https://posts.careerengine.us/author/${id}/rss`, {
                headers: {
                    'User-Agent': UA,
                },
            })
            .then((_) => _.data)
    );

    const items = await Promise.all(
        feed.items.splice(0, 10).map((item) => {
            // generally speaking, changing `item.link` of an existing route could potentially break `item.guid`
            // but since the route has been down for at least 8 months, it's probably safe
            item.link = item.link.replace(/^http:\/\//, 'https://');
            return cache.tryGet(item.link, async () => {
                const response = await got.get(item.link, {
                    headers: {
                        'User-Agent': UA,
                    },
                });

                const $ = load(response.data);

                const description = fixArticleContent($('.post'));

                let pubDate = item.pubDate;
                if (!pubDate || pubDate === 'Invalid Date') {
                    // sometimes the pubDate is not available in the official feed
                    const postDate = $('.post-date')
                        .text()
                        .replaceAll(/\s+|发表/g, '');
                    // the date format is "发表 YYYY年MM月DD日 "
                    // following the official feed behavior: imprecise date is in UTC
                    // `<pubDate>Mon, 04 Apr 2022 00:00:00 GMT</pubDate>`
                    pubDate = parseDate(postDate, 'YYYY年MM月DD日');
                    pubDate = new Date(pubDate.getTime() - pubDate.getTimezoneOffset() * 60 * 1000);
                }

                return {
                    title: item.title,
                    description,
                    pubDate,
                    link: item.link,
                };
            });
        })
    );

    ctx.set('data', {
        title: `微信公众号 - ${feed.title}`,
        link: `https://posts.careerengine.us/author/${id}/posts`,
        description: feed.description,
        item: items,
    });
};
