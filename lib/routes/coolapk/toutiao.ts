import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/toutiao/:type?',
    categories: ['social-media'],
    example: '/coolapk/toutiao',
    parameters: { type: '默认为history' },
    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_HOTLINK_TEMPLATE',
                optional: true,
                description: '设置为`true`并添加`image_hotlink_template`参数来代理图片',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '头条',
    maintainers: ['xizeyoupan'],
    handler,
    description: `| 参数名称 | 历史头条 | 最新   |
| -------- | -------- | ------ |
| type     | history  | latest |`,
};

async function handler(ctx) {
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

    return {
        title: urls[type].title,
        link: 'https://www.coolapk.com/',
        description: urls[type].title,
        item: out,
    };
}
