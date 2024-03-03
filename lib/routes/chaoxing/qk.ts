// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const needContent = /t|y/i.test(ctx.req.param('needContent') ?? 'true');

    const rootUrl = 'http://m.chaoxing.com';
    const currentUrl = `${rootUrl}/mqk/json?size=${ctx.req.query('limit') ?? 30}&mags=${id}&isort=20`;

    const headers = {
        cookie: 'duxiu=userName_dsr%2C%3Dmmxy%2C!userid_dsr%2C%3D837%2C!enc_dsr%2C%3D7EDE234634FC80D554A7F6D1AA0D3629; AID_dsr=665; msign_dsr=1638170006420;',
    };

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });

    let items = response.data.list.map((item) => ({
        title: item.infos.C301,
        author: item.infos.C303,
        link: item.infos.read,
        category: [item.infos.C314, item.infos.C031],
        pubDate: parseDate(item.infos.C103, 'YYYYMMDD'),
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: (item.infos.M305 ?? item.infos.C305 ?? '').trim(),
        }),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (needContent) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        headers,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('#article_content').html() ?? content('body').html();
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: response.data.list[0].infos.C307,
        link: `${rootUrl}/mqk/list?mags=${id}&isort=20&from=space`,
        item: items,
    });
};
