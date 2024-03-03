// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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
        const description = art(path.join(__dirname, 'templates/zhongchou.art'), {
            item,
        });

        return {
            title,
            link,
            description,
            guid: item.id,
        };
    });

    ctx.set('data', {
        title: `淘宝众筹-${type}`,
        link: 'https://izhongchou.taobao.com/index.htm',
        item: items,
    });
};
