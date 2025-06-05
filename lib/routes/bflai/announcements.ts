import { Route, DataItem, Data } from '@/types'; // RSSHub 类型定义
import ofetch from '@/utils/ofetch'; // HTTP 请求库
import { load } from 'cheerio'; // HTML 解析
import { parseDate } from '@/utils/parse-date'; // 日期解析
import cache from '@/utils/cache'; // 缓存工具

const ROOT_URL = 'https://bfl.ai'; // 将根URL定义为常量，方便维护

/**
 * 辅助函数：获取并解析单个公告详情页，提取正文内容。
 * 使用缓存机制 (cache.tryGet) 避免重复请求。
 *
 * @param {string} itemLink - 文章详情页的完整链接。
 * @param {string} fallbackDescription - 如果详情页抓取失败或内容为空时使用的备用描述 (通常是列表页的摘要)。
 * @returns {Promise<string>} 文章的描述内容 (HTML格式)。
 */
const fetchDescription = (itemLink: string, fallbackDescription: string): Promise<string> =>
    cache.tryGet(itemLink, async () => {
        // console.log(`   CACHE MISS - Fetching detail page: ${itemLink}`); // 调试时可保留注释，方便以后维护者调试
        let detailPageHtml;
        try {
            detailPageHtml = await ofetch(itemLink, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 RSSHub',
                },
            });
        } catch {
            // console.error(`   ERROR fetching detail page ${itemLink}: ${error.message}`);
            return fallbackDescription || `Error fetching full content from ${itemLink}.`; // 获取详情失败，返回备用描述或错误提示
        }

        const $detailPage = load(detailPageHtml);

        // 如果网站结构变化，此选择器可能需要更新。
        const detailContentSelector = 'div.max-w-3xl.mx-auto.px-6';
        const fullDescription = $detailPage(detailContentSelector).html()?.trim();

        return fullDescription || fallbackDescription; // 如果提取不到正文，也回退到备用描述
    });

/**
 * 主路由处理函数
 * 负责抓取 bfl.ai 公告列表，并为每篇文章获取详细描述。
 * @returns {Promise<Data>} 包含RSS源数据的对象。
 */
async function handler(): Promise<Data> {
    const listPageUrl = `${ROOT_URL}/announcements`;

    const listPageHtml = await ofetch(listPageUrl, {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 RSSHub',
        },
    });

    const $ = load(listPageHtml); // Cheerio实例，用于解析列表页

    // 提取整个RSS源的元数据
    const feedTitle = $('head title').text().trim() || 'BFL AI Announcements';
    const feedDescription = $('head meta[name="description"]').attr('content')?.trim() || 'Latest announcements from Black Forest Labs (bfl.ai).';

    // 列表项选择器，选取每个公告的 <a> 标签
    const listItemsSelector = 'div.flex.flex-col.max-w-3xl.mx-auto.space-y-8 > a[href^="/announcements/"]';
    const announcementLinks = $(listItemsSelector);

    // 从列表页初步提取每个条目的信息
    const preliminaryItems: Partial<DataItem>[] = announcementLinks // 使用 Partial<DataItem> 因为此时 description 可能只是摘要
        .toArray()
        .map((anchorElement) => {
            const $anchor = $(anchorElement);

            const relativeLink = $anchor.attr('href');
            const link = relativeLink ? `${ROOT_URL}${relativeLink}` : undefined; // 如果链接无效，则为 undefined
            const title = $anchor.find('h2[class*="text-xl"]').text().trim();

            const $timeElement = $anchor.find('time');
            const datetimeAttr = $timeElement.attr('datetime');
            const timeText = $timeElement.text().trim();
            // 优先使用 datetime 属性，其次是文本内容，如果都没有则 pubDate 为 undefined
            const pubDate = datetimeAttr ? parseDate(datetimeAttr) : (timeText ? parseDate(timeText) : undefined);

            // 列表页的摘要作为备用/初始描述
            const description = $anchor.find('p[class*="line-clamp-3"]').html()?.trim() || '';
            const author = 'Black Forest Labs'; // 作者固定

            // 只有包含有效标题和链接的条目才被认为是初步有效的
            if (title && link) {
                return {
                    title,
                    link,
                    description, // 列表页摘要
                    pubDate: pubDate ? pubDate.toUTCString() : new Date().toUTCString(), // 确保 pubDate 是 UTC 字符串
                    author,
                };
            }
            return null; // 无效条目返回 null
        })
        .filter((item): item is DataItem => item !== null && item.link !== undefined); // 过滤掉 null 并确保 link 存在 (类型守卫)

    // 并行获取所有文章的完整描述
    const items: DataItem[] = await Promise.all(
        preliminaryItems.map(async (item) => ({
            ...item,
            description: await fetchDescription(item.link!, item.description!),
        }))
    );

    return {
        title: feedTitle,
        link: listPageUrl,
        description: feedDescription,
        item: items,
        language: 'en', // 根据网站实际语言调整
        // image: `${ROOT_URL}/path/to/logo.png`, // 可选：提供一个RSS源的图标URL
        // allowEmpty: false, // 默认，如果抓取不到内容会报错；设为true则输出空源
    };
}

/**
 * 定义并导出RSSHub路由对象
 */
export const route: Route = {
    /**
     * 路由路径 (相对于命名空间 /bflai)
     * 例如: /bflai/announcements
     */
    path: '/announcements',

    /**
     * 路由分类，用于在RSSHub网站上分类显示
     * 请参考官方文档的分类列表: https://docs.rsshub.app/joinus/quick-start#fen-lei-gen-ju
     */
    categories: ['programming', 'multimedia'], // 'blog' 分类可能不准确, 'programming' 或 'multimedia' (因涉及AI图像) 可能更合适

    /**
     * 路由使用示例的URL (相对于RSSHub根路径)
     */
    example: '/bflai/announcements',

    /**
     * 路由参数说明 (此路由无参数)
     */
    parameters: {},

    /**
     * 路由特性说明
     */
    features: {
        requireConfig: false, // 本路由无需用户配置
        requirePuppeteer: false, // 本路由不使用Puppeteer
        antiCrawler: false, // 目标网站目前反爬程度不高，N+1请求建议配合缓存使用
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },

    /**
     * RSSHub Radar 规则，帮助浏览器扩展发现此RSS源
     */
    radar: [
        {
            source: ['bfl.ai/announcements'], // 匹配此网站路径
            target: '/announcements', // 对应到本路由的相对路径
            title: 'Announcements', // 在Radar中显示的标题 (可选，但推荐)
            // docs: 'https://docs.rsshub.app/routes/programming#bfl-ai-announcements', // 提交PR时，需在官方文档中添加对应说明，并在此处填写链接
        },
    ],

    /**
     * 路由的可读名称，将作为文档标题等使用
     */
    name: 'Announcements',

    /**
     * 路由维护者的GitHub ID数组
     */
    maintainers: ['thirteenkai'],

    /**
     * 核心处理函数
     */
    handler,

    /**
     * 此RSS源对应的原始网站页面URL
     */
    url: 'https://bfl.ai/announcements',

    /**
     * 路由的详细描述，会显示在文档中
     */
    description: 'Fetches the latest announcements from Black Forest Labs (bfl.ai). Provides full article content by default with caching.',
};
