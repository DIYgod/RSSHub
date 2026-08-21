import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

const STATUS_MAP = {
    up: '上涨',
    down: '下跌',
};

export const route: Route = {
    path: '/gushitong/index/:market?',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/baidu/gushitong/index',
    parameters: {
        market: {
            description: '市场分类，默认为亚洲市场，即上证指数、深圳成指、恒生指数、富时中国A50、日经225指数和韩国综合指数',
            options: [
                { label: '亚洲', value: 'asia' },
                { label: '美洲', value: 'america' },
                { label: '欧非', value: 'europeafrica' },
                { label: '外汇', value: 'foreign' },
                { label: '债券', value: 'bond' },
                { label: '其他', value: 'other' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['finance.baidu.com/'],
        },
    ],
    name: '首页指数',
    maintainers: ['CaoMeiYouRen', 'hutianyu2006'],
    handler,
    url: 'finance.baidu.com/',
};

async function handler(ctx) {
    const market = ctx.req.param('market') || '';
    const response = await got(`https://finance.pae.baidu.com/api/getbanner?market=${market}&finClientType=pc`, {
        headers: {
            'Acs-Token': '600',
        },
    });
    const item = response.data.Result.list.map((e) => ({
        title: e.name,
        description: renderToString(
            <p>
                市场：{e.market.toUpperCase()}
                <br />
                代码：{e.code}
                <br />
                收盘价：{e.lastPrice}
                <br />
                涨跌幅：{e.ratio}
                <br />
                涨跌额：{e.increase}
                <br />
                走势：{STATUS_MAP[e.status]}
                <br />
            </p>
        ),
        link: `https://finance.baidu.com/${e.subType || market || 'index'}/${e.market}-${e.code}`,
    }));
    return {
        title: 'FinScope',
        description: 'FinScope，汇聚全球金融市场的股票、基金、外汇、期货等实时行情，7*24小时覆盖专业财经资讯，提供客观、准确、及时、全面的沪深港美上市公司股价、财务、股东、分红等信息，让用户在复杂的金融市场，更简单的获取投资信息。',
        link: 'https://finance.baidu.com/',
        item,
    };
}
