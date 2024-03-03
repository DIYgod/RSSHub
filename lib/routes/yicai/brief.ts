// @ts-nocheck
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const { rootUrl } = require('./utils');

export default async (ctx) => {
    const currentUrl = `${rootUrl}/brief`;
    const apiUrl = `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${ctx.req.query('limit') ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.indexTitle,
        link: `${rootUrl}${item.url}`,
        description: item.newcontent,
        pubDate: timezone(parseDate(`${item.datekey} ${item.hm}`, 'YYYY.MM.DD HH:mm'), +8),
    }));

    ctx.set('data', {
        title: '第一财经 - 正在',
        link: currentUrl,
        item: items,
    });
};
