import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const types = {
    newslist: 'newsList',
    r18list: 'newsPornList',
};

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'newslist';
    const category = ctx.req.param('category') ?? 'all';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://news.gamebase.com.tw';
    const currentUrl = `${rootUrl}/news/${type}?type=${category}`;

    const apiRootUrl = 'https://api.gamebase.com.tw';
    const apiUrl = `${apiRootUrl}/api/news/getNewsList`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            GB_type: types[type],
            category,
            page: 1,
        },
    });

    const titleResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(titleResponse.data);

    const items = await Promise.all(
        response.data.return_msg.list.slice(0, limit).map((item) =>
            cache.tryGet(`gamebase:news:${type}:${category}:${item.news_no}`, async () => {
                const i = {};

                i.author = item.nickname;
                i.title = item.news_title;
                i.link = `${rootUrl}/news/detail/${item.news_no}`;
                i.description = item.news_meta?.meta_des ?? '';
                i.pubDate = timezone(parseDate(item.post_time), +8);
                i.category = [item.system];

                if (i.description) {
                    return i;
                }

                const detailResponse = await got({
                    method: 'get',
                    url: i.link,
                });

                const description = detailResponse.data.match(/(\\u003C.*?)","/)[1].replaceAll('\\"', '"');

                i.description = description.replaceAll(/\\u[\da-f]{4}/gi, (match) => String.fromCharCode(Number.parseInt(match.replaceAll('\\u', ''), 16)));

                return i;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
