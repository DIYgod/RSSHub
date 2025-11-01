import { Route } from '@/types';
import cache from '@/utils/cache'; // 明确引入 cache
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'http://saa.zju.edu.cn';

export const route: Route = {
    path: '/saau/notice',
    name: '航空航天学院 - 通知公告',
    categories: ['university'],
    url: host,
    maintainers: ['heikuisey130'],

    radar: [
        {
            source: ['saa.zju.edu.cn/67629/list.htm'],
            target: '/saau/notice',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/zju/saau/notice',

    handler: async () => {
        const listUrl = new URL('67629/list.htm', host).href;

        // 1. 获取列表页
        const response = await got(listUrl, {});

        const $ = load(response.data);

        // 从列表页解析出所有文章条目
        const list = $('.news_list.list2 li')
            .toArray()
            .map((item) => {
                const element = $(item);
                const titleElement = element.find('a');
                const title = titleElement.attr('title');
                const href = titleElement.attr('href');

                // 确保 title 和 href 存在
                if (!title || !href) {
                    return null;
                }

                return {
                    title,
                    link: new URL(href, host).href,
                    pubDate: element.find('.news_meta').text().trim(),
                };
            })
            .filter(Boolean); // 过滤掉 null 值

        // 2. 遵循 index.ts 的模式，并发获取所有文章的全文内容
        const items = await Promise.all(
            list
                .filter((item): item is NonNullable<typeof item> => item !== null)
                .map((item) =>
                    // 使用 cache.tryGet 获取和缓存文章详情
                    cache.tryGet(item.link, async () => {
                        const detailResponse = await got(item.link);
                        const content = load(detailResponse.data);

                        // 提取完整的文章正文（包含图片）
                        const fullContent = content('.wp_articlecontent').html() || '';

                        // 创建纯文本摘要（移除图片和HTML标签）
                        const textOnly = content('.wp_articlecontent').clone();
                        textOnly.find('img').remove(); // 移除所有图片
                        const fullText = textOnly.text().trim();
                        // 使用完整的文本内容作为描述，不进行截断
                        const description = fullText;

                        return {
                            title: item.title,
                            link: item.link,
                            description, // RSS阅读器首页显示的纯文本摘要
                            content: {
                                html: fullContent, // 正文显示的完整HTML内容（包含图片）
                                text: textOnly.text().trim(), // 纯文本版本
                            },
                            pubDate: parseDate(`${item.pubDate} GMT+8`),
                        };
                    })
                )
        );

        return {
            title: '浙江大学 - 航空航天学院 - 通知公告',
            link: listUrl,
            description: '浙江大学航空航天学院的通知公告更新。',
            item: items,
        };
    },
};
