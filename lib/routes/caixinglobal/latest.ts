// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data } = await got('https://gateway.caixin.com/api/extapi/homeInterface.jsp', {
        searchParams: {
            subject: '100990318;100990314;100990311',
            start: 0,
            count: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20,
            type: '2',
            _: Date.now(),
        },
    });

    const list = data.datas.map((e) => ({
        title: e.desc,
        description: e.summ,
        link: e.link,
        pubDate: parseDate(e.time),
        category: e.tags.map((t) => t.name),
        nid: e.nid,
        attr: e.attr,
        enclosure_url: e.audioUrl,
        enclosure_type: e.audioUrl ? 'audio/mpeg' : undefined,
        itunes_item_image: e.audioUrl ? e.pict.imgs[0].url : undefined,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);
                $('.loadingBox, .cons-pay-tip').remove();

                let content = $('#appContent').prop('outerHTML');

                if (item.attr === 0) {
                    const { data } = await got('https://u.caixinglobal.com/get/reading.do', {
                        searchParams: {
                            id: item.nid,
                            source: '',
                            url: item.link,
                            _: Date.now(),
                        },
                    });
                    content = data.data.content;
                }

                item.description = $('.cons-photo').prop('outerHTML') + content;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'The Latest Top Headlines on China - Caixin Global',
        description: 'The latest headlines on China finance, companies, politics, international affairs and other China-related issues from around the world. Caixin Global',
        language: 'en',
        link: 'https://www.caixinglobal.com/news/',
        item: items,
    });
};
