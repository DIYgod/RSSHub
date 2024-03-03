// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const titles = {
    5: '侠创',
    6: '纽约数据科学学院',
    9: 'RS实验所',
    10: '阿里云天池',
};

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://dtcj.com';
    const currentUrl = `${rootUrl}/api/v1/data_hero_informations?per=15&page=1&topic_id=${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        author: item.author,
        link: `https://dtcj.com/topic/${item.id}`,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.summary-3_j7Wt, .content-3mNFyi').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${category ? titles[category] : '全部'} - 数据侠专栏 | DT 财经`,
        link: currentUrl,
        item: items,
    });
};
