// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const apiUrl = 'https://ehall.wtu.edu.cn/wtu/api/queryBulletinListByConditional.do?pageNum=1&pageSize=20&columnId=';
    const listUrl = 'https://ehall.wtu.edu.cn/new/list.html?type=';
    const psgUrl = 'https://ehall.wtu.edu.cn/new/detail-word.html?';
    const map = new Map([
        [1, { title: '通知公告', type: '2', id: '1994a3b58bef4ee887e1efc19881decd' }],
        [2, { title: '教务信息', type: '6', id: '36d47fcd3e774f289adfef1d93138a9d' }],
        [3, { title: '科研动态', type: '7', id: '48e8abfb983b4e4486b69feacad1dc1b' }],
    ]);

    const typeInt = Number.parseInt(ctx.req.param('type'));
    const value = map.get(typeInt);
    const title = value.title;
    const columnId = value.id;
    const type = value.type;
    const res = await got({
        method: 'get',
        url: `${apiUrl}${columnId}`,
    });
    const resJson = res.data.bulletinList;

    ctx.set('data', {
        title: `${title} - 武汉纺织大学信息门户`,
        link: `${listUrl}${type}`,
        description: `${title} - 武汉纺织大学信息门户`,
        item: resJson.map((item) => ({
            title: item.TITLE,
            pubDate: timezone(parseDate(item.CREATE_TIME), 8),
            link: item.GOTO_URL ?? `${psgUrl}type=${type}?bulletinId=${item.WID}`,
            author: item.PUBLISH_USER_DEPT_NAME,
        })),
    });
};
