import { Route, ViewType, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://jannyai.com';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/jannyai/search/dragon',
    parameters: {
        keyword: {
            description: '搜索关键词',
        },
    },
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
            source: ['jannyai.com/'],
            target: '/search/:keyword',
        },
    ],
    name: '搜索',
    maintainers: ['xuanipvp'],
    handler,
    description: '获取JannyAI网站搜索结果中的角色列表',
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `${baseUrl}/?query=${encodeURIComponent(keyword)}&hide_bot=checked`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.grid-cols-2 > a').toArray().map((element) => {
        const $element = $(element);
        const link = baseUrl + $element.attr('href');
        const title = $element.find('h5').text().trim();
        const imageUrl = $element.find('img').attr('src') || '';

        return {
            title,
            link,
            pubDate: parseDate(new Date().toISOString()), // 使用当前时间作为发布时间
            author: 'JannyAI',
            guid: link,
            imageUrl, // 临时存储图片URL，后续处理时使用
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { title, link, pubDate, author, guid, imageUrl } = item;

                try {
                    // 获取角色详情页内容
                    const detailResponse = await ofetch(link);
                    const $detail = load(detailResponse);

                    // 获取角色描述
                    const description = $detail('.overflow-hidden > div').text().trim() ||
                                       $('.overflow-hidden > div').text().trim() || ''; // 尝试在列表页获取

                    // 获取角色标签
                    const tags = $detail('ul > li').toArray().map((tag) =>
                        $(tag).find('span').text().trim()
                    ).join(', ') ||
                    $('.grid-cols-2 > a').find('ul > li').toArray().map((tag) =>
                        $(tag).find('span').text().trim()
                    ).join(', ') || ''; // 尝试在列表页获取

                    // 构建HTML描述
                    const htmlDescription = `
                        <p>${description}</p>
                        <p>标签: ${tags}</p>
                        <p><img src="${imageUrl}" alt="${title}"></p>
                    `;

                    return {
                        title,
                        link,
                        description: htmlDescription,
                        pubDate,
                        author,
                        guid,
                    } as DataItem;
                } catch {
                    return {
                        title,
                        link,
                        description: `<p>获取角色详情失败</p><p><img src="${imageUrl}" alt="${title}"></p>`,
                        pubDate,
                        author,
                        guid,
                    } as DataItem;
                }
            })
        )
    );

    return {
        title: `JannyAI - 搜索: ${keyword}`,
        link: url,
        description: `JannyAI网站搜索"${keyword}"的结果`,
        item: items.filter(Boolean) as DataItem[], // 过滤掉可能的null值
    };
}
