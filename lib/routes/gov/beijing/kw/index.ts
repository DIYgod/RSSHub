import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://kw.beijing.gov.cn';

export const route: Route = {
    path: '/beijing/kw/:channel',
    name: 'Unknown',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const url = `${rootUrl}/col/${channel}/index.html`;

    const response = await got.get(url);
    const $ = load(response.data);
    const title = $('a.bt_link').last().text().replace('>', '');
    const dataJs = $('div.left.zhengce_right > script[language="javascript"]').html() || $('div.centent_width > script[language="javascript"]').html();
    let items = dataJs
        .match(/urls\[i]='(.*?)';headers\[i]="(.*?)";year\[i]='(\d+)';month\[i]='(\d+)';day\[i]='(\d+)';/g)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .map((item) => {
            const result = item.match(/urls\[i]='(.*?)';headers\[i]="(.*?)";year\[i]='(\d+)';month\[i]='(\d+)';day\[i]='(\d+)';/);
            return {
                title: load(result[2])('a').attr('title') || result[2],
                link: new URL(result[1], rootUrl).href,
                pubDate: parseDate(`${result[3]}-${result[4]}-${result[5]}`, 'YYYY-MM-DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = await got.get(item.link);
                const $ = load(content.data);
                item.description = $('#zoom').html() || $('div.left.zhengce_right').html();

                return item;
            })
        )
    );

    return {
        title: `北京市科学技术委员会、中关村科技园区管理委员会 - ${title}`,
        link: url,
        item: items,
    };
}
