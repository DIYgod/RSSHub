import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { renderHTML } from './utils';

export const route: Route = {
    path: ['/', '/news'],
    name: 'Unknown',
    maintainers: ['AtlanCI', 'CcccFz'],
    handler,
    url: 'gocn.vip/',
};

async function handler() {
    const base_url = 'https://gocn.vip/c/3lQ6GbD5ny/home';
    const article_url = 'https://gocn.vip/c/3lQ6GbD5ny';
    const api_url = 'https://gocn.vip/api/home/page';

    const response = await got({
        url: api_url,
        headers: {
            Referer: base_url,
        },
    });

    const items = response.data.data.articlePageList.list.map((item) => ({
        title: item.name,
        link: `${article_url}/s/${item.spaceGuid}/d/${item.guid}`,
        description: renderHTML(JSON.parse(item.content)),
        pubDate: parseDate(item.ctime, 'X'),
        author: item.nickname,
    }));

    return {
        title: `GoCN社区-最新动态`,
        link: base_url,
        description: `获取GoCN站点最新动态`,
        item: items,
    };
}
