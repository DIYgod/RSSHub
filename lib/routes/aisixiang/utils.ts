// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const ossUrl = 'https://oss.aisixiang.com';
const rootUrl = 'https://www.aisixiang.com';

const ProcessFeed = (limit, tryGet, items) =>
    Promise.all(
        items.slice(0, limit).map((item) =>
            tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const commentMatches = content('h3.comment-header')
                    .text()
                    .match(/评论（\d+）/);

                item.title = content('h3').first().text().split('：').pop();
                item.description = content('div.article-content').html();
                item.author = content('div.about strong').first().text();
                item.category = content('u')
                    .first()
                    .parent()
                    .find('u')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = timezone(parseDate(content('div.info').text().split('时间：').pop()), +8);
                item.upvotes = content('span.like-num').text() ? Number.parseInt(content('span.like-num').text(), 10) : 0;
                item.comments = commentMatches ? Number.parseInt(commentMatches[1], 10) : 0;

                return item;
            })
        )
    );

module.exports = {
    rootUrl,
    ossUrl,
    ProcessFeed,
};
