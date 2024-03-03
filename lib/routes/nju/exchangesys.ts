// @ts-nocheck
import got from '@/utils/got';
const dayjs = require('dayjs');

export default async (ctx) => {
    const type = ctx.req.param('type');
    const type_dict = {
        news: ['http://elite.nju.edu.cn/exchangesystem/index/moreList', 'http://elite.nju.edu.cn/exchangesystem/index/more?type=xw', '新闻通知'],
        proj: ['http://elite.nju.edu.cn/exchangesystem/index/moreXmList', 'http://elite.nju.edu.cn/exchangesystem/index/more?type=xm', '交换生项目'],
    };

    const url = type_dict[type][0] + '?page=1&limit=20&.me=c3lzLmluZGV4';
    const { data } = await got({
        url,
        headers: {
            Referer: type_dict[type][1],
        },
    });

    ctx.set('data', {
        title: `本科生交换生管理系统-${type_dict[type][2]}`,
        link: type_dict[type][1],
        item:
            data &&
            data.data &&
            data.data.map((item) => {
                if (type === 'proj') {
                    return {
                        title: item.mc,
                        description: item.mc,
                        pubDate: dayjs(item.cjsj),
                        link: item.sqyq,
                    };
                }
                if (type === 'news') {
                    return {
                        title: item.bt,
                        author: item.createBy,
                        description: item.nr,
                        pubDate: dayjs(item.createDate),
                        link: `http://elite.nju.edu.cn/exchangesystem/index/detail?pid=${item.pid}`,
                    };
                }
                return null;
            }),
    });
};
