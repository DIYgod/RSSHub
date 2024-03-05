// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const option = ctx.req.param('type');

    const response = await got({
        method: 'get',
        url: 'https://www.ithome.com/block/rank.html',
    });
    const $ = load(response.data);

    const config = {
        '24h': '24 小时最热',
        '7days': '7 天最热',
        monthly: '月榜',
    };

    const type2id = {
        '24h': 'd-1',
        '7days': 'd-2',
        monthly: 'd-3',
    };

    const title = config[option];
    const id = type2id[option];

    if (!id) {
        throw new Error('Bad type. See <a href="https://docs.rsshub.app/routes/new-media#it-zhi-jia">https://docs.rsshub.app/routes/new-media#it-zhi-jia</a>');
    }

    const list = $(`#${id} > li`)
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
            };
            return info;
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(res.data);
                const paragraph = content('#paragraph');
                paragraph.find('img[data-original]').each((_, ele) => {
                    ele = $(ele);
                    ele.attr('src', ele.attr('data-original'));
                    ele.removeAttr('class');
                    ele.removeAttr('data-original');
                });
                item.description = paragraph.html();
                item.pubDate = new Date(content('#pubtime_baidu').text() + ' GMT+8').toUTCString();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `IT之家-${title}`,
        link: 'https://www.ithome.com',
        item: items,
    });
};
