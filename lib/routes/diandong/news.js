import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://webapi.diandong.com';

const titleMap = {
    0: '推荐',
    29: '新车',
    61: '导购',
    30: '试驾',
    75: '用车',
    22: '技术',
    24: '政策',
    23: '行业',
};

export default async (ctx) => {
    const cate = ctx.req.param('cate') ?? 0;
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 25;
    const url = `${rootUrl}/content/list?page=1&size=${limit}&source_id=12&content_type=news&content_ids=&category_id=${cate}`;

    const response = await got(url);
    const data = response.data.data.list;
    const list = data.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.published),
        author: item.author,
        link: `https://www.diandong.com/news/${item.contentid}.html`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#gallery-selector').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `电动邦 - ${titleMap[cate]}`,
        link: 'https://www.diandong.com/news',
        item: items,
    });
};
