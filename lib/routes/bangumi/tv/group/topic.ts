// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const base_url = 'https://bgm.tv';

export default async (ctx) => {
    const groupID = ctx.req.param('id');
    const link = `${base_url}/group/${groupID}/forum`;
    const { data: html } = await got(link);
    const $ = load(html);
    const title = 'Bangumi - ' + $('.SecondaryNavTitle').text();

    const items = await Promise.all(
        $('.topic_list .topic')
            .toArray()
            .map(async (elem) => {
                const link = new URL($('.subject a', elem).attr('href'), base_url).href;
                const fullText = await cache.tryGet(link, async () => {
                    const { data: html } = await got(link);
                    const $ = load(html);
                    return $('.postTopic .topic_content').html();
                });
                const summary = 'Reply: ' + $('.posts', elem).text();
                return {
                    link,
                    title: $('.subject a', elem).attr('title'),
                    pubDate: parseDate($('.lastpost .time', elem).text()),
                    description: fullText ? summary + '<br><br>' + fullText : summary,
                    author: $('.author a', elem).text(),
                };
            })
    );

    ctx.set('data', {
        title,
        link,
        item: items,
    });
};
