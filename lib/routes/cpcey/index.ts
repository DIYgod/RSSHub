// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://cpc.ey.gov.tw';

const typeMap = {
    xwg: {
        name: '新闻稿',
        url: '/Page/A3412E2A5A7B398F',
    },
    xfzx: {
        name: '消费资讯',
        url: '/Page/E414CC218269CCE8',
    },
};

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'xwg';
    const url = rootUrl + typeMap[type].url;

    const response = await got.get(url);
    const $ = load(response.data);
    const list = $('div.words > ul > li')
        .map((_, item) => {
            const date = $(item).find('span').text();
            const dateArr = date.split('-');
            const dateStr = Number.parseInt(dateArr[0]) + 1911 + '/' + dateArr[1] + '/' + dateArr[2];

            return {
                link: rootUrl + $(item).find('a').attr('href'),
                title: $(item).find('a').attr('title'),
                pubDate: parseDate(dateStr, 'YYYY/MM/DD'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            let desc = '';
            const isOtherWebPage = !item.link.includes('.html');
            if (isOtherWebPage) {
                desc = await cache.tryGet(item.link, async () => {
                    const response = await got.get(item.link);
                    const $ = load(response.data);
                    const desc = $('div.words > div.graybg.ail > div').html();
                    return desc;
                });
            }
            item.description = desc;
            return item;
        })
    );

    ctx.set('data', {
        title: `行政院消费者保护会-${typeMap[type].name}`,
        link: url,
        item: items,
    });
};
