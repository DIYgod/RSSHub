// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { renderHTML } = require('./utils');

export default async (ctx) => {
    const api_url = 'https://gocn.vip/api/files?spaceGuid=Gd7OHl&currentPage=1&sort=1';
    const base_url = 'https://gocn.vip/c/3lQ6GbD5ny/s/Gd7OHl';
    const job_url = 'https://gocn.vip/c/3lQ6GbD5ny';

    const response = await got({
        url: api_url,
    });

    const items = response.data.data.list.map((item) => ({
        title: item.name,
        link: `${job_url}/s/${item.spaceGuid}/d/${item.guid}`,
        description: renderHTML(JSON.parse(item.content)),
        pubDate: parseDate(item.ctime, 'X'),
        author: item.nickname,
    }));

    ctx.set('data', {
        title: `GoCN社区-招聘`,
        link: base_url,
        description: `获取GoCN站点招聘`,
        item: items,
    });
};
