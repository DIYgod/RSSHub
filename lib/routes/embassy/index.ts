import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import supportedList from './supported-list';

export const route: Route = {
    path: '/:country/:city?',
    name: 'Unknown',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const country = ctx.req.param('country');
    const city = ctx.req.param('city') ?? undefined;

    let config = supportedList[country.toLowerCase()];
    let desc;

    if (city === undefined) {
        desc = `中国驻${config.countryCN}大使馆 -- 重要通知`;
    } else {
        config = config.consulates[city.toLowerCase()];
        desc = `中国驻${config.cityCN}领事馆 -- 重要通知`;
    }

    const link = config.link;
    const hostname = new URL(link).hostname;

    const res = await got(link);
    const $ = load(res.data);

    const list = [];

    $(config.list)
        .slice(0, 10)
        .each((i, e) => {
            const temp = new URL($(e).attr('href'), link);
            if (temp.hostname === hostname) {
                list.push(temp);
            }
        });

    const out = await Promise.all(
        list.map((link) =>
            cache.tryGet(link.href, async () => {
                const response = await got(link);
                const $ = load(response.data);
                const single = {
                    title: $(config.title).text(),
                    link,
                    description: $(config.description).html(),
                    pubDate: parseDate($(config.pubDate).text().replace('(', '').replace(')', '')),
                };
                return single;
            })
        )
    );

    return {
        title: desc,
        description: desc,
        link,
        item: out,
    };
}
