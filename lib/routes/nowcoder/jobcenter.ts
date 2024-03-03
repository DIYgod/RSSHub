// @ts-nocheck
import cache from '@/utils/cache';
const url = require('url');
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const rootUrl = `https://www.nowcoder.com/job/center/`;
    const currentUrl = `${rootUrl}?${ctx.req.param('type') ? 'type=' + ctx.req.param('type') : ''}${ctx.req.param('city') ? '&city=' + ctx.req.param('city') : ''}${ctx.req.param('order') ? '&order=' + ctx.req.param('order') : ''}${
        ctx.req.param('recruitType') ? '&recruitType=' + ctx.req.param('recruitType') : ''
    }${ctx.req.param('latest') ? '&latest=' + ctx.req.param('latest') : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('ul.reco-job-list li')
        .slice(0, 30)
        .map((_, item) => {
            item = $(item);
            const title = item.find('a.reco-job-title');
            const company = item.find('div.reco-job-com a');
            const time = item.find('div.reco-job-detail span').eq(1).text();
            const date = new Date();
            if (time.includes('天')) {
                const day = time.split('天')[0];
                date.setDate(date.getDate() - day);
            } else if (time.includes('小时')) {
                const hour = time.split('小时')[0];
                date.setHours(date.getHours() - hour);
            }
            return {
                title: `${company.text()} | ${title.text()}`,
                link: url.resolve(rootUrl, title.attr('href')),
                pubDate: date.toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.description = content('div.rec-job').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${ctx.req.param('recruitType') ? (ctx.req.param('recruitType') === '2' ? '社招广场' : '实习广场') : '实习广场'} - 牛客网`,
        link: rootUrl,
        item: items,
    });
};
