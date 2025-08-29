import { Route } from '@/types'; // 定义路由类型的TypeScript接口
import cache from '@/utils/cache'; // RSSHub的缓存工具，用于减少重复请求
import got from '@/utils/got'; // HTTP请求库，用于获取网页内容
import { load } from 'cheerio'; // 服务器端的jQuery实现，用于解析HTML
import { parseDate } from '@/utils/parse-date'; // 日期解析工具，将字符串转换为Date对象

/**
 * 路由配置对象
 */
export const route: Route = {
    path: '/mem/gk/zfxxgkpt/fdzdgknr', // 路由路径
    categories: ['government'], // 分类标签
    example: 'https://rsshub.app/gov/mem/gk/zfxxgkpt/fdzdgknr', // 使用用例
    parameters: {}, // 参数说明
    features: {
        // 功能特性配置
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        // RSSHub Radar配置，用于自动发现
        {
            source: ['www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr'],
            target: '/mem/gk/zfxxgkpt/fdzdgknr',
        },
    ],
    name: '应急管理部法定主动公开内容', // 路由名称（中文）
    maintainers: ['skeaven'], // 维护者列表
    handler, // 处理函数
    description: `无参数`, // 详细说明，参数
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30; // 设置查询参数限制

    const rootUrl = 'https://www.mem.gov.cn';
    const currentUrl = new URL(`gk/zfxxgkpt/fdzdgknr`, rootUrl).href;

    const { data: fdzdgknrResponse } = await got(currentUrl); // 获取网页内容
    const fdzdgknr$ = load(fdzdgknrResponse); // 使用cheerio加载HTML以便解析

    /**
     * 获取原始目标网页
     */
    const iframeUrl = fdzdgknr$('div.scy_main_r iframe').attr('src');

    const { data: response } = await got(iframeUrl); // 获取网页内容

    const $ = load(response);

    /**
     * 获取icon
     */
    const icon = new URL('favicon.ico', rootUrl).href;

    /**
     * 提取文章列表
     */
    let items = $('div.scy_main_V2_list')
        .find('tr')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const aLabel = $(item).find('a[href]');
            const href = aLabel.attr('href');
            if (href) {
                const link = currentUrl + aLabel.attr('href').replaceAll('..', '');
                return {
                    title: aLabel.contents().first().text(),
                    link,
                    pubDate: parseDate($(item).find('.fbsj').text()),
                };
            } else {
                return null;
            }
        })
        .filter(Boolean);

    // 获取每个项目的详情
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                // 只处理HTML页面
                if (!item.link.endsWith('.html') && !item.link.endsWith('.shtml')) {
                    return item;
                }

                try {
                    const { data: detailResponse } = await got(item.link);
                    const content = load(detailResponse);

                    // 提取详细信息
                    const description = content('#content').html();
                    const author = content('td.td_lable:contains("所属机构")').next('td').text().trim();
                    const category = content('td.td_lable:contains("主题分类")').next('td').text().trim();

                    return {
                        ...item,
                        description,
                        author: author || '未知机构',
                        category: category || '未知分类',
                    };
                } catch {
                    return item;
                }
            })
        )
    );

    /**
     * 返回数据
     */
    return {
        item: items,
        title: route.name,
        link: currentUrl,
        icon,
    };
}
