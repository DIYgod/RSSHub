import { Route, ViewType, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

const baseUrl = 'https://jannyai.com';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/jannyai',
    parameters: {},
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
        },
    ],
    name: '最新角色',
    maintainers: ['xuanipvp'],
    handler,
    description: '获取JannyAI网站首页最新角色列表',
};

async function handler() {
    const url = baseUrl;
    // 添加请求头，模拟真实浏览器请求
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
    const response = await ofetch(url, { headers });
    const $ = load(response);

    // 根据网站实际结构调整选择器
    const list = $('.grid-cols-2 a[data-astro-prefetch="hover"]').toArray().map((element) => {
        const $element = $(element);
        const href = $element.attr('href') || '';
        const link = href.startsWith('http') ? href : baseUrl + href;
        const title = $element.find('h5').text().trim();
        const imageUrl = $element.find('img').attr('src') || '';

        return {
            title,
            link,
            author: 'JannyAI',
            guid: link,
            imageUrl, // 临时存储图片URL，后续处理时使用
        };
    });

    // 如果没有找到任何角色，返回一个基本的结果
    if (list.length === 0) {
        return {
            title: 'JannyAI - 最新角色',
            link: baseUrl,
            description: 'JannyAI网站最新角色列表',
            item: [{
                title: '获取角色列表失败',
                link: baseUrl,
                description: '无法获取角色列表，请检查网站结构是否变化',
                author: 'JannyAI',
                guid: `${baseUrl}#error-${Date.now()}`,
            }] as DataItem[],
        };
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { title, link, author, guid, imageUrl } = item;

                try {
                    // 获取角色详情页内容，添加相同的请求头和超时设置
                    const detailResponse = await ofetch(link, {
                        headers,
                        retry: 2,
                        timeout: 10000,
                    });
                    const $detail = load(detailResponse);

                    // 获取角色描述，尝试多种可能的选择器
                    let description = '';
                    const descSelectors = [
                        '.overflow-hidden > div',
                        '.mb-3.overflow-hidden',
                        '.text-xs.text-gray-700',
                        '.text-sm.font-normal'
                    ];

                    for (const selector of descSelectors) {
                        const text = $detail(selector).text().trim();
                        if (text) {
                            description = text;
                            break;
                        }
                    }

                    // 获取角色标签
                    const tags = $detail('ul.flex li').toArray()
                        .map((tag) => $detail(tag).find('span').text().trim())
                        .filter(Boolean)
                        .join(', ') || '';

                    // 构建HTML描述
                    const htmlDescription = `
                        <p>${description || '暂无描述'}</p>
                        ${tags ? `<p>标签: ${tags}</p>` : ''}
                        <p><img src="${imageUrl}" alt="${title}"></p>
                    `;

                    return {
                        title,
                        link,
                        description: htmlDescription,
                        author,
                        guid,
                        pubDate: new Date().toISOString(), // 添加发布日期
                    } as DataItem;
                } catch {
                    // 错误处理，不使用console
                    return {
                        title,
                        link,
                        description: `<p>获取角色详情失败</p><p><img src="${imageUrl}" alt="${title}"></p>`,
                        author,
                        guid,
                        pubDate: new Date().toISOString(), // 添加发布日期
                    } as DataItem;
                }
            })
        )
    );

    return {
        title: 'JannyAI - 最新角色',
        link: baseUrl,
        description: 'JannyAI网站最新角色列表',
        item: items.filter(Boolean) as DataItem[], // 过滤掉可能的null值
    };
}
