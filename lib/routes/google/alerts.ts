// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');

    const { data: response, url: link } = await got('https://www.google.com/alerts/preview', {
        searchParams: {
            params: `[null,[null,null,null,[null,"${keyword}","com",[null,"en","US"],null,null,null,0,0],null,3,[[null,1,"user@example.com",[null,null,20],2,"en-US",null,null,null,null,null,"0",null,null,"AB2Xq4hcilCERh73EFWJVHXx-io2lhh1EhC8UD8"]]],0]`,
        },
    });

    const $ = load(response, null, false);

    const items = $('li.result')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.result_title a');
            return {
                title: title.text(),
                link: new URL(title.attr('href')).searchParams.get('url'),
                author: item.find('.result_source').text(),
                description: item.find('.snippet').html(),
            };
        });

    ctx.set('data', {
        title: `Google Alerts - ${keyword}`,
        link,
        item: items,
    });
};
