import { Route } from '@/types';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date'; // 解析日期的工具函数

export const route: Route = {
    path: '/zwgk',
    categories: ['government'],
    radar: [
        {
            source: ['pudong.gov.cn/:zwgk'],
            target: '/zwgk',
        },
    ],
    name: '政务公开',
    maintainers: ['Himingway'],
    handler,
};

async function getFullArticle(link) {
    const response = await got(link).catch(() => null);
    if (!response) {
        return null;
    }
    const $ = load(response.body);
    const content = $('#ivs_content');
    if (content.length === 0) {
        return null;
    }
    // resolve links of <img> and <a>
    content.find('img').each((_, e) => {
        const absLink = $(e).attr('src');
        $(e).attr('src', absLink);
    });
    content.find('a').each((_, e) => {
        const absLink = $(e).attr('href');
        $(e).attr('href', absLink);
    });
    return content.html();
}

async function handler() {
    const response = await ofetch('https://www.pudong.gov.cn/zwgk-search-front/api/data/affair', {
        method: 'POST',
        body: {
            channelList: ['5144'],
            pageSize: 20,
        },
    });
    const data = response.data.list;

    const itemsPromises = data.map(async (item) => {
        const fullArticle = await getFullArticle(item.url);
        return {
            title: item.title,
            link: item.url,
            pubDate: parseDate(item.issue_date),
            description: fullArticle,
        };
    });

    const items = await Promise.all(itemsPromises);

    return {
        // 源标题
        title: `信息公开_政务公开-上海市浦东新区门户网站`,
        // 源链接
        link: `https://www.pudong.gov.cn/zwgk/zxxxgk/index.html`,
        // 源文章
        item: items,
    };
}
