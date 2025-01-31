import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/chongqing/gzw/:category{.+}?',
    parameters: {
        category: '分类，见下表，默认为通知公告',
    },
    name: '重庆市人民政府 国有资产监督管理委员会',
    url: 'gzw.cq.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    radar: [
        {
            source: 'gzw.cq.gov.cn/*category',
            target: '/chongqing/gzw/*category',
        },
    ],
    description: `| 通知公告  | 国企资讯 | 国企简介 | 国企招聘 |
| --------- | -------- | -------- | -------- |
| tzgg\_191 | gqdj     | gqjj     | gqzp     |`,
};

async function handler(ctx) {
    const { category = 'tzgg_191' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://gzw.cq.gov.cn';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.tab-item li.clearfix')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: new URL(a.prop('href').replace(/^\./, category), rootUrl).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('div.trs_paper_default').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = content('meta[name="Keywords"]').prop('content').split(/;/).filter(Boolean);
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: `${$('title').text()} - ${$('meta[name="ColumnName"]').prop('content')}`,
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image: new URL($('div.logo img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="ColumnKeywords"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
        allowEmpty: true,
    };
}
