import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.alwayscontrol.com.cn';

export const route: Route = {
    path: '/news',
    categories: ['other'],
    example: '/alwayscontrol/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新动态',
    maintainers: ['moss-xxh'],
    url: 'alwayscontrol.com.cn',
    handler,
    radar: [
        {
            source: ['/zh-CN/news/list'],
            target: '/news',
        },
    ],
    description: 'Always Control（旭衡电子）智能能源管理系统解决方案专家的最新动态',
};

async function handler() {
    const listUrl = `${baseUrl}/zh-CN/news/list`;

    // 获取新闻列表页面
    const response = await got(listUrl);
    const $ = load(response.data);

    // 解析新闻列表
    const list = $('article')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h2').text().trim();
            const date = $item.find('time').text().trim();
            const link = $item.find('a').attr('href');
            const image = $item.find('img').attr('src');

            return {
                title,
                link: link ? `${baseUrl}${link}` : '',
                pubDate: parseDate(date, 'YYYY-MM-DD'),
                image: image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : '',
            };
        });

    // 获取每篇新闻的详细内容
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link) {
                    return item;
                }

                try {
                    const detailResponse = await got(item.link);
                    const $detail = load(detailResponse.data);

                    // 提取文章内容
                    const content = $detail('article').html() || '';

                    // 处理图片URL（相对路径转绝对路径）
                    let processedContent = content.replaceAll(/src="(\/[^"]+)"/g, `src="${baseUrl}$1"`);

                    // 清理RSS阅读器不支持的样式和标签，保留核心内容
                    const $content = load(processedContent);

                    // 移除所有 class、style 等属性，但保留 src、href、alt
                    $content('*').each((_, elem) => {
                        const $elem = $content(elem);
                        const allowedAttrs = new Set(['src', 'href', 'alt', 'title']);
                        const attrs = Object.keys(elem.attribs || {});
                        for (const attr of attrs) {
                            if (!allowedAttrs.has(attr)) {
                                $elem.removeAttr(attr);
                            }
                        }
                    });

                    // 简化图片标签：将 <figure><img></figure> 转为 <p><img></p>
                    $content('figure').each((_, elem) => {
                        const $figure = $content(elem);
                        const img = $figure.find('img');
                        if (img.length > 0) {
                            $figure.replaceWith(`<p>${$content(img).toString()}</p>`);
                        }
                    });

                    processedContent = $content('body').html() || processedContent;

                    item.description = processedContent;
                    item.author = '旭衡电子(深圳)有限公司';
                    item.category = ['公司动态', '最新资讯'];

                    return item;
                } catch {
                    // 如果获取详情失败,返回基本图片信息
                    item.description = item.image ? `<img src="${item.image}">` : '';
                    return item;
                }
            })
        )
    );

    return {
        title: 'Always Control - 最新动态',
        link: listUrl,
        description: 'Always Control（旭衡电子）- 智能能源管理系统解决方案专家最新动态',
        language: 'zh-CN',
        item: items,
        image: `${baseUrl}/logo.png`,
    };
}
