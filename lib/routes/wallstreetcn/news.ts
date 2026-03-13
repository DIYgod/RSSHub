import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    global: '最新',
    shares: '股市',
    bonds: '债市',
    commodities: '商品',
    forex: '外汇',
    enterprise: '公司',
    'asset-manage': '资管',
    tmt: '科技',
    estate: '地产',
    car: '汽车',
    medicine: '医药',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['finance'],
    example: '/wallstreetcn/news',
    radar: [
        {
            source: ['wallstreetcn.com/news/:category', 'wallstreetcn.com/'],
        },
    ],
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| id           | 分类 |
| ------------ | ---- |
| global       | 最新 |
| shares       | 股市 |
| bonds        | 债市 |
| commodities  | 商品 |
| forex        | 外汇 |
| enterprise   | 公司 |
| asset-manage | 资管 |
| tmt          | 科技 |
| estate       | 地产 |
| car          | 汽车 |
| medicine     | 医药 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'global';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/news/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/information-flow?channel=${category}-channel&accept=article&limit=${ctx.req.query('limit') ?? 25}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.items
        .filter((item) => item.resource_type !== 'ad')
        .map((item) => ({
            type: item.resource_type,
            guid: item.resource.id,
            link: item.resource.uri,
            pubDate: parseDate(item.resource.display_time * 1000),
        }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/apiv1/content/${item.type === 'live' ? `lives/${item.guid}` : `articles/${item.guid}?extract=0`}`,
                });

                const responseData = detailResponse.data;

                // 处理 { code: 60301, message: '内容不存在或已被删除', data: {} }
                if (responseData.code !== 20000) {
                    return null;
                }

                const data = responseData.data;

                item.title = data.title || data.content_text;
                item.author = data.source_name ?? data.author.display_name;
                item.description = data.content + (data.content_more ?? '');
                item.category = data.asset_tags?.map((t) => t.name) ?? [];

                if (data.audio_uri) {
                    item.enclosure_type = 'audio/mpeg';
                    item.enclosure_url = data.audio_uri;
                    item.itunes_item_image = data.image?.uri ?? '';
                    item.itunes_duration = data.audio_info?.duration ?? '';
                }

                delete item.type;

                return item;
            })
        )
    );

    items = items.filter((item) => item !== null);

    return {
        title: `华尔街见闻 - 资讯 - ${titles[category]}`,
        link: currentUrl,
        item: items,
        itunes_author: '华尔街见闻',
        image: 'https://static.wscn.net/wscn/_static/favicon.png',
    };
}
