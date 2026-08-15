import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const mapping = {
    '/project': {
        title: '项目介绍',
        list: '/front/index/project/page?size=10&current=1&simpleName=&areaId=',
        detail: '/front/index/project',
        link: '/#/communityDetail?id=',
    },
    '/announcement': {
        title: '通知公告',
        list: '/front/announcement/page?current=1&size=10',
        detail: '/front/announcement',
        link: '/#/announcementList/detail?id=',
    },
};

export const route: Route = {
    path: '/bphc/:caty',
    name: '保障房中心 - 共有产权住房租赁服务平台',
    example: '/gov/beijing/bphc/announcement',
    parameters: { caty: '类别' },
    maintainers: ['bigfei'],
    handler,
    description: `|   通知公告   | 项目介绍 |
| :----------: | :------: |
| announcement |  project |`,
};

async function handler(ctx) {
    const rootUrl = 'https://gycpt.bphc.com.cn';

    const { caty = 'announcement' } = ctx.req.param();
    const obj = mapping[`/${caty}`];
    const currentUrl = `${rootUrl}${obj.list}`;

    const listResp = await ofetch(currentUrl);
    const list = listResp.data?.records ?? [];
    const items = await Promise.all(
        list.map((item) => {
            const detail = `${rootUrl}${obj.detail}/${item.id}`;
            return cache.tryGet(detail, async () => {
                const detailResponse = await ofetch(detail);
                const description = (detailResponse.data?.content || detailResponse.data?.introduction) ?? '';
                const single = {
                    title: item.title || item.fullName,
                    author: description.match(/来源：(.*?)</)?.[1].trim() ?? item.operator,
                    link: `${rootUrl}${obj.link}${item.id}`,
                    description,
                    pubDate: timezone(parseDate(item.createTime), 8),
                };
                return single;
            });
        })
    );

    return {
        title: obj.title,
        link: rootUrl,
        item: items,
    };
}
