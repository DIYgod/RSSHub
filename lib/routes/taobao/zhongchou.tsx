import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/zhongchou/:type?',
    categories: ['shopping'],
    example: '/taobao/zhongchou/all',
    parameters: { type: '类型, 默认为 `all` 全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '众筹项目',
    maintainers: ['xyqfer', 'Fatpandac'],
    handler,
    description: `| 全部 | 科技 | 食品        | 动漫 | 设计   | 公益 | 娱乐 | 影音  | 书籍 | 游戏 | 其他  |
| ---- | ---- | ----------- | ---- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all  | tech | agriculture | acg  | design | love | tele | music | book | game | other |`,
};

async function handler(ctx) {
    const { type = 'all' } = ctx.req.param();
    const map = {
        all: '',
        tech: '121288001',
        agriculture: '123330001,125672021',
        acg: '122018001',
        design: '121292001,126176002,126202001',
        love: '121280001',
        tele: '121284001',
        music: '121278001',
        book: '121274002',
        game: '122020001',
        other: '125706031,125888001,125886001,123332001',
    };
    const url = `https://izhongchou.taobao.com/dream/ajax/getProjectListNew.htm?_input_charset=utf-8&type=6&pageSize=20&page=1&sort=1&status=&projectType=${encodeURIComponent(map[type])}&_=${Date.now()}&callback=`;
    const response = await got({
        method: 'get',
        url,
    });

    const items = response.data.data.map((item) => {
        const title = item.name;
        const link = `https://izhongchou.taobao.com/dreamdetail.htm?id=${item.id}`;
        const description = renderToString(
            <>
                <img src={item.image} />
                <br />
                <br />
                <strong>达成率:</strong> {`${item.finish_per}%`}
                <br />
                <strong>已筹金额:</strong> {`${item.curr_money}元`}
                <br />
                <strong>支持人数:</strong> {item.buy_amount}
                <br />
            </>
        );

        return {
            title,
            link,
            description,
            guid: item.id,
        };
    });

    return {
        title: `淘宝众筹-${type}`,
        link: 'https://izhongchou.taobao.com/index.htm',
        item: items,
    };
}
