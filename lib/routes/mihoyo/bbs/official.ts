// @ts-nocheck
import got from '@/utils/got';
const { post2item } = require('./utils');
// 游戏id
const GITS_MAP = {
    1: '崩坏三',
    2: '原神',
    3: '崩坏二',
    4: '未定事件簿',
    6: '崩坏：星穹铁道',
    8: '绝区零',
};

// 公告类型
const TYPE_MAP = {
    1: '公告',
    2: '活动',
    3: '资讯',
};

export default async (ctx) => {
    const { gids, type = '2', page_size = '20', last_id = '' } = ctx.req.param();
    const query = new URLSearchParams({
        gids,
        type,
        page_size,
        last_id,
    }).toString();
    const url = `https://bbs-api.miyoushe.com/post/wapi/getNewsList?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const title = `米游社 - ${GITS_MAP[gids] || ''} - ${TYPE_MAP[type] || ''}`;
    const items = list.map((e) => post2item(e));
    const data = {
        title,
        link: url,
        item: items,
    };

    ctx.set('data', data);
};
