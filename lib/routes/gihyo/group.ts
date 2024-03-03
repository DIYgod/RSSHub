// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const groupId = ctx.req.param('id');

    const baseUrl = 'https://gihyo.jp';
    const url = `${baseUrl}/list/group/${groupId}`;

    const response = await got(url);

    const $ = load(response.data);
    const articles = $('ul[class=m-listitem]').find('li').not('.m-listitem--ad');
    const title = $('head title').text();
    const link = url;
    const description = $('head meta[name=description]').attr('content');
    const language = 'ja';

    const item = articles
        .map((_, article) => {
            const _subtitle = $('p.m-listitem__title span.subtitle', article).text();
            const _title = $('p.m-listitem__title', article)
                .contents()
                .filter((_, el) => el.nodeType === 3)
                .text();
            const title = `${_subtitle} ${_title}`;
            const author = $('p.m-listitem__author', article).text();
            const pubDate = timezone(parseDate($('span.date', article).text(), 'YYYY-MM-DD'), +9);
            const link = `${baseUrl}${$('a', article).attr('href')}`.replace(/\?summary$/, '');
            return {
                title,
                author,
                pubDate,
                link,
            };
        })
        .get();

    ctx.set('data', {
        title,
        link,
        description,
        language,
        item,
    });
};
