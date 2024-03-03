// @ts-nocheck
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
require('dayjs/locale/zh-cn');
dayjs.extend(localizedFormat);

export default async (ctx) => {
    const q = ctx.req.param('keyword');
    const searchParams = new URLSearchParams({
        format: 'rss',
        q,
    });
    const url = new URL('https://cn.bing.com/search');
    url.search = searchParams.toString();
    const data = await parser.parseURL(url.toString());
    ctx.set('data', {
        title: data.title,
        link: data.link,
        description: data.description + ' - ' + data.copyright,
        image: data.image.url,
        item: data.items.map((e) => ({
            ...e,
            description: e.content,
            pubDate: parseDate(e.pubDate, 'dddd, DD MMM YYYY HH:mm:ss [GMT]', 'zh-cn'),
        })),
    });
};
