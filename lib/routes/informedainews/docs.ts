import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/zh-Hans/docs/:type',
    categories: ['new-media', 'popular'],
    example: '/informedainews/zh-Hans/docs/world-news-daily',
    parameters: { type: 'world-news-daily|tech-enthusiast-weekly|ai-enthusiast-daily' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['informedainews.com', 'informedainews.com/zh-Hans/docs/:type', 'informedainews.com/docs/:type'],
            target: '/zh-Hans/docs/:type',
        },
    ],
    name: '知闻AI',
    maintainers: ['guicaiyue'],
    handler,
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    const response = await ofetch(`https://informedainews.com/zh-Hans/docs/${type}`);
    const $ = load(response);
    const list = $('li.theme-doc-sidebar-item-category ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const text = a.text();
            // 找到第一个'('字符的位置
            const start = text.indexOf('(');
            // 找到第一个')'字符的位置
            const end = text.indexOf(')');
            // 从第一个'('到第一个')'之间的子字符串就是日期
            const date = text.substring(start + 1, end);
            return {
                title: text,
                link: `https://informedainews.com${a.attr('href')}`,
                pubDate: parseDate(date),
                author: 'AI',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // 选择类名为“comment-body”的第一个元素
                item.description = $('.theme-doc-markdown.markdown').first().html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );
    return {
        // 源标题
        title: `${type} docs`,
        // 源链接
        link: `https://informedainews.com/zh-Hans/docs/${type}`,
        // 源文章
        item: items,
    };
}
