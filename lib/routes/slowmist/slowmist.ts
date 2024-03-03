// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.slowmist.com';
import { finishArticleItem } from '@/utils/wechat-mp';

export default async (ctx) => {
    let type = ctx.req.param('type');

    let title = '慢雾科技 - ';
    switch (type) {
        case 'news':
            title += '公司新闻';

            break;

        case 'vul':
            title += '漏洞披露';

            break;

        case 'research':
            title += '技术研究';

            break;

        default:
            type = 'news';
            title += '公司新闻';
    }

    const url = `${baseUrl}/api/get_list?type=${type}`;

    const response = await got(url);

    let items = (response.data.data || []).map((item) => ({
        title: item.title,
        link: item.url,
        description: item.desc,
        pubDate: parseDate(item.date),
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(item)));

    ctx.set('data', {
        title,
        link: url,
        item: items,
    });
};
