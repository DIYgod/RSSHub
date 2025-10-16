import type { Route, DataItem } from '../../types'; // 显式导入 DataItem
import cache from '../../utils/cache'; // 引入缓存工具
import ofetch from '../../utils/ofetch'; // 用于获取 HTML
import { load } from 'cheerio'; // 用于解析 HTML
import { parseDate } from '../../utils/parse-date'; // 用于解析日期
import timezone from '../../utils/timezone'; // 用于处理时区

const baseUrl = 'https://jwc.ahszu.edu.cn';

export const route: Route = {
    path: '/jwc/tzgg', // 定义路由路径
    categories: ['university'], // 路由分类
    example: '/ahszu/jwc/tzgg', // 路由示例
    parameters: {}, // 此路由不需要参数
    features: {
        // 路由特性
        requireConfig: false, // 不需要额外配置
        requirePuppeteer: false, // 不需要 Puppeteer
        antiCrawler: false, // 没有反爬虫
        supportBT: false, // 不支持 BT
        supportPodcast: false, // 不支持播客
        supportScihub: false, // 不支持 Sci-hub
    },
    radar: [
        // RSSHub Radar 规则
        {
            source: ['jwc.ahszu.edu.cn/tzgg.htm', 'jwc.ahszu.edu.cn'],
            target: '/jwc/tzgg',
        },
    ],
    name: '教务处通知公告', // 路由名称
    maintainers: ['wskeei'],
    handler, // 路由处理函数
    url: 'jwc.ahszu.edu.cn/tzgg.htm', // 目标网站具体页面 URL
    description: `安徽宿州学院教务处通知公告`, // 路由描述
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_ctx) {
    // 明确告诉 ESLint 忽略下一行的未使用变量规则
    const link = `${baseUrl}/tzgg.htm`;
    const response = await ofetch(link); // 获取页面 HTML
    const $ = load(response); // 加载 HTML 到 cheerio

    // 定义 list 中元素的预期类型（过滤 null 之前）
    type InitialItem = {
        title: string;
        link: string;
        pubDate: Date;
    } | null;

    const list: InitialItem[] = $('.list li') // 选择列表项
        .toArray()
        .map((element): InitialItem => {
            // 明确 map 返回类型
            const $item = $(element);
            const a = $item.find('a');
            const span = $item.find('span'); // 定位包含日期的 span 标签
            const itemUrl = a.attr('href');

            // 检查 itemUrl 是否有效
            if (!itemUrl) {
                return null; // 如果链接无效，则跳过此项
            }

            // 确保链接是绝对路径
            const absoluteUrl = itemUrl.startsWith('http') ? itemUrl : new URL(itemUrl, baseUrl).href;

            return {
                title: a.attr('title') || a.text() || '', // 确保 title 是 string
                link: absoluteUrl, // 获取绝对链接
                pubDate: timezone(parseDate(span.text().trim(), 'YYYY年MM月DD日'), +8), // 使用正确的日期格式解析
            };
        });

    // 过滤掉 null 并进行类型断言
    const validList = list.filter((item): item is Exclude<InitialItem, null> => item !== null);

    // 获取全文内容
    const items: DataItem[] = await Promise.all(
        validList.map(
            (
                item // 使用过滤后的 validList
            ) =>
                cache.tryGet(item.link, async (): Promise<DataItem> => {
                    // 明确 cache 回调返回 Promise<DataItem>
                    try {
                        const detailResponse = await ofetch(item.link);
                        const $detail = load(detailResponse);

                        // --- 重要：修改这里的选择器以匹配实际的正文容器 ---
                        const description = $detail('.v_news_content').html() || ''; // 获取内容，如果为空则设为空字符串
                        // ------------------------------------------------

                        // 返回符合 DataItem 结构的对象
                        return {
                            ...item, // 包含 title, link, pubDate
                            description, // 添加 description
                        };
                    } catch {
                        // 如果获取详情页失败，返回基础信息，description 为空
                        return {
                            ...item,
                            description: '',
                        };
                    }
                })
        )
    );

    return {
        title: '安徽宿州学院 - 教务处通知公告', // RSS 源标题
        link, // RSS 源链接
        item: items, // 使用包含全文的列表
        description: '安徽宿州学院教务处发布的最新通知公告', // RSS 源描述
    };
}
