// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const rootUrl = 'https://hnrb.voc.com.cn';
    const currentUrl = `${rootUrl}/hnrb_epaper`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    response = await got({
        method: 'get',
        url: `${currentUrl}/${id ? response.data.match(/URL=(.*)"/)[1].replace(/node_\d+\.htm$/, `node_20${id}.htm`) : response.data.match(/URL=(.*)"/)[1]}`,
    });

    const $ = load(response.data);

    const matches = response.data.match(/images\/(\d{4}-\d{2}\/\d{2})\/\d{2}\/\d+_brief/);
    const link = `${rootUrl}/hnrb_epaper/html/${matches[1]}`;

    let items = $('tbody')
        .eq(1)
        .find('a')
        .toArray()
        .map((a) => `${link}/${$(a).attr('href').replace(/\.\//, '')}`)
        .filter((a) => a.endsWith('div=-1'));

    if (!id) {
        await Promise.all(
            $('#pageLink')
                .slice(1)
                .toArray()
                .map((p) => `${link}/${$(p).attr('href').replace(/\.\//, '')}`)
                .map(async (p) => {
                    const pageResponse = await got({
                        method: 'get',
                        url: p,
                    });

                    const page = load(pageResponse.data);

                    items.push(
                        ...page('tbody')
                            .eq(1)
                            .find('a')
                            .toArray()
                            .map((a) => `${link}/${page(a).attr('href').replace(/\.\//, '')}`)
                            .filter((a) => a.endsWith('div=-1'))
                    );
                })
        );
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item,
                });

                const content = load(detailResponse.data);

                return {
                    link: item,
                    title: content('.font01').text(),
                    description: content('#ozoom').html(),
                    pubDate: timezone(parseDate(matches[1], 'YYYY-MM/DD'), +8),
                };
            })
        )
    );

    ctx.set('data', {
        title: `湖南日报${id ? ` - ${$('strong').first().parent().text()}` : ''}`,
        link: currentUrl,
        item: items,
    });
};
