import { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

const dict = {
    industry: { id: 434, name: '行业资讯' },
    dynamic: { id: 436, name: '协会动态' },
    notices: { id: 438, name: '重要通知' },
    policies: { id: 440, name: '政策法规' },
};

export const route: Route = {
    path: 'news/:type',
    categories: ['government'],
    example: '/samd/news/policies',
    parameters: { type: '文章类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| 行业资讯 | 协会动态 | 重要通知 | 政策法规 |
    | -------- | ------- | ------- | -------- |
    | industry | dynamic | notices | policies |`,
    name: '资讯信息',
    maintainers: ['hualiong'],
    handler: async (ctx) => {
        const baseURL = 'https://www.samd.org.cn/home';
        const type = ctx.req.param('type');

        const { rows } = await ofetch('/GetNewsByTagId', {
            baseURL,
            method: 'POST',
            query: {
                page: 1,
                rows: 10,
                typeId: dict[type].id,
                status: 1,
            },
        });

        const list: DataItem[] = rows.map((row) => ({
            id: row.auto_id,
            guid: row.auto_id,
            title: row.title,
            category: [row.tag_names],
            link: `${baseURL}/newsDetail?id=${row.auto_id}&typeId=${dict[type].id}`,
            image: row.img_url ? baseURL + row.img_url : null,
        }));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(String(item.id), async () => {
                    const $ = load(await ofetch(item.link!));

                    const content = $('.content');
                    item.author = content.find('.author span').text();
                    item.pubDate = timezone(parseDate(content.find('.time').text(), '发布时间：YYYY-MM-DD HH:mm:ss'), +8);

                    content.children('.titles').remove();
                    content.children('.auxi').remove();
                    item.description = content.html()!;

                    return item;
                })
            )
        );

        return {
            title: `${dict[type].name} - 深圳市医疗器械行业协会`,
            link: 'https://www.samd.org.cn/home/newsList',
            item: items as DataItem[],
        };
    },
};
