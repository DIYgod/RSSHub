// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type') || 'history';
    const urls = {
        history: {
            url: 'https://api.coolapk.com/v6/page/dataList?url=%23%2ffeed%2fheadlineV8List%3ftype%3d0%2c5%2c9%2c8%2c12%2c10%2c11%2c13%26title%3d%e5%8e%86%e5%8f%b2%e5%a4%b4%e6%9d%a1%26page%3d1',
            title: '历史头条',
        },
        latest: {
            url: 'https://api.coolapk.com/v6/page/dataList?url=%23%2ffeed%2fdigestList%3ftype%3d0%2c5%2c12%2c10%2c11%2c13%2c8%2c9%26title%3d%e6%9c%80%e6%96%b0%e5%8a%a8%e6%80%81%26page%3d1',
            title: '最新动态',
        },
    };
    const response = await got(urls[type].url, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    const out = await Promise.all(data.map((item) => utils.parseDynamic(item)));

    ctx.set('data', {
        title: urls[type].title,
        link: 'https://www.coolapk.com/',
        description: urls[type].title,
        item: out,
    });
};
