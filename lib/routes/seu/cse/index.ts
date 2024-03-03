// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://cse.seu.edu.cn';

    const map = {
        22535: { initial: 'xyxw' },
        22536: { initial: 'tzgg' },
        22538: { initial: 'jwxx' },
        22537: { initial: 'jyxx' },
        22539: { initial: 'xgsw' },
    };

    const { type = 22535 } = ctx.req.param();
    const id = type.length === 4 ? Object.keys(map).find((key) => map[key].initial === type) : Number.parseInt(type); // backward compatible
    const link = new URL(`${id}/list.htm`, host).href;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.news_list .news')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('.news_title a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('.news_meta').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                } catch (error) {
                    // intranet
                    if (error.response.url.startsWith('https://newids.seu.edu.cn/')) {
                        return item;
                    }
                    throw error;
                }
                const $ = load(response.data);

                item.description = $('div.wp_articlecontent').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        link,
        title: `${$('meta[name=keywords]').attr('content')}${$('meta[name=description]').attr('content')} -- ${$('head title').text()}`,
        description: '东南大学计算机技术与工程学院RSS',
        item: out,
    });
};
