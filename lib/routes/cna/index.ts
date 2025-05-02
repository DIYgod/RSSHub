import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    categories: ['traditional-media'],
    example: '/cna/aall',
    parameters: { id: '分类 id 或新闻专题 id。分类 id 见下表，新闻专题 id 為 https://www.cna.com.tw/list/newstopic.aspx 中，連結的數字部份。此參數默认为 aall' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |`,
};

async function handler(ctx) {
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
                        .toArray()
                        .map((e) => e.attribs.content),
                    content('.active > a').text(),
                ];

                return item;
            })
        )
    );

    return {
        title: metadata.Title,
        description: metadata.Description,
        link: metadata.CanonicalUrl,
        image: metadata.Image,
        item: items,
    };
}
