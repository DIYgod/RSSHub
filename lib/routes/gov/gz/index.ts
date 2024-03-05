// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.gz.gov.cn';

const urlMap = {
    gzyw: 'gzyw',
    jrtt: 'jrtt',
    tzgg: 'tzgg',
    zcjd: 'zcjd/zcjd',
};

export default async (ctx) => {
    const channel = ctx.req.param('channel');
    const category = ctx.req.param('category');
    const url = `${rootUrl}/${channel}/${urlMap[category]}/`;
    const response = await got(url);
    const $ = load(response.data);

    const items = $('.news_list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.find('a').attr('href');
            return {
                title: item.find('a').attr('title'),
                link: href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    ctx.set('data', {
        title: `广州市人民政府 - ${$('.main_title').text()}`,
        link: url,
        item: items,
    });
};
