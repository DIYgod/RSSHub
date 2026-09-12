import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/open/announce',
    categories: ['programming'],
    example: '/meituan/open/announce',
    name: '技术服务合作中心平台公告',
    maintainers: ['youzipi'],
    handler,
};

async function handler() {
    const response = await ofetch('https://developer.meituan.com/api/v4/front/announcement/menu-page?docKey=anno-all&pageSize=15&pageNum=1&count=0');
    const docList = response.data.docList;

    const url = 'https://developer.meituan.com/api/v1/doc/content';

    const item = await Promise.all(
        docList.map((item) => {
            const articleUrl = `${url}?docKey=${item.docKey}`;

            return cache.tryGet(`${articleUrl}_${item.modifyTime}`, async () => {
                const articleResp = await ofetch(articleUrl);
                return {
                    title: item.title,
                    link: `https://developer.meituan.com/isv/announcement/detail?dockey=anno-all&id=${item.docKey}`,
                    description: articleResp.data.docDataItemDtos.map((c) => c.content).join(''),
                    pubDate: parseDate(item.modifyTime, 'X'),
                };
            });
        })
    );

    return {
        title: '美团技术服务合作中心-公告',
        link: 'https://developer.meituan.com/isv/announcement/list',
        item,
    };
}
