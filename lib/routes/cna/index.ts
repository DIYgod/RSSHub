// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const id = ctx.req.param('id') || 'aall';
    const isTopic = /^\d+$/.test(id);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const { data: response } = await got({
        method: 'post',
        url: `https://www.cna.com.tw/cna2018api/api/${isTopic ? 'WTopic' : 'WNewsList'}`,
        json: {
            action: '0',
            category: isTopic ? 'newstopic' : id,
            tno: isTopic ? id : undefined,
            pagesize: limit,
            pageidx: 1,
        },
    });

    const {
        ResultData: { MetaData: metadata },
        ResultData: resultData,
    } = response;
    const list = (isTopic ? resultData.Topic.NewsItems : resultData.Items).slice(0, limit).map((item) => ({
        title: item.HeadLine,
        link: item.PageUrl,
        pubDate: timezone(parseDate(item.CreateTime), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                content('div.SubscriptionInner').remove();
                const topImage = content('.fullPic').html();

                item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();
                item.category = [
                    ...content("meta[property='article:tag']")
                        .get()
                        .map((e) => e.attribs.content),
                    content('.active > a').text(),
                ];

                return item;
            })
        )
    );

    ctx.set('data', {
        title: metadata.Title,
        description: metadata.Description,
        link: metadata.CanonicalUrl,
        image: metadata.Image,
        item: items,
    });
};
