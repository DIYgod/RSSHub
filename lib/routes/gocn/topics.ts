// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { renderHTML } = require('./utils');

export default async (ctx) => {
    const base_url = 'https://gocn.vip/c/3lQ6GbD5ny/home';
    const article_url = 'https://gocn.vip/c/3lQ6GbD5ny';
    const api_url = 'https://gocn.vip/api/files?spaceGuid=Gd7BTB&currentPage=1&sort=1';

    const response = await got({
        url: api_url,
        headers: {
            Referer: base_url,
        },
    });

    const items = response.data.data.list.map((item) => ({
        title: item.name,
        link: `${article_url}/s/${item.spaceGuid}/d/${item.guid}`,
        description: renderHTML(JSON.parse(item.content)),
        pubDate: parseDate(item.ctime, 'X'),
        author: item.nickname,
    }));

    ctx.set('data', {
        title: `GoCN社区-每日新闻`,
        link: base_url,
        description: `获取GoCN站点每日新闻`,
        item: items,
    });
};
