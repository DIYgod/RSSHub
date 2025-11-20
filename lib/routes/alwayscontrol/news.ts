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
            source: ['/zh-CN/news/list', '/'],
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

                    // 处理图片URL
                    const processedContent = content.replaceAll(/src="(\/[^"]+)"/g, `src="${baseUrl}$1"`);

                    item.description = processedContent;
                    item.author = '旭衡电子(深圳)有限公司';
                    item.category = ['公司动态', '最新资讯'];

                    return item;
                } catch {
                    // 如果获取详情失败,返回基本信息
                    item.description = `<img src="${item.image}"><br><p>${item.title}</p>`;
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
