import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import utils from './utils';

const { TYPE } = utils;

export const route: Route = {
    path: '/quotation/history/:type',
    categories: ['other'],
    example: '/cebbank/quotation/history/usd',
    parameters: { type: '货币的缩写，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '外汇牌价',
    maintainers: ['linbuxiao'],
    handler,
    description: `#### 总览 {#zhong-guo-guang-da-yin-hang-wai-hui-pai-jia-zong-lan}


#### 历史牌价 {#zhong-guo-guang-da-yin-hang-wai-hui-pai-jia-li-shi-pai-jia}

| 美元 | 英镑 | 港币 | 瑞士法郎 | 瑞典克郎 | 丹麦克郎 | 挪威克郎 | 日元 | 加拿大元 | 澳大利亚元 | 新加坡元 | 欧元 | 澳门元 | 泰国铢 | 新西兰元 | 韩圆 |
| ---- | ---- | ---- | -------- | -------- | -------- | -------- | ---- | -------- | ---------- | -------- | ---- | ------ | ------ | -------- | ---- |
| usd  | gbp  | hkd  | chf      | sek      | dkk      | nok      | jpy  | cad      | aud        | sgd      | eur  | mop    | thb    | nzd      | krw  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `https://www.cebbank.com/eportal/ui?struts.portlet.action=/portlet/whpjFront!toView.action&moduleId=12094&pageId=477260&currcode=${TYPE[type].id}&currentPagebak=1&currentPage=1`;
    const res = await got({
        method: 'get',
        url,
    });

    const $ = load(res.data);

    const items = $('.lczj_box tbody tr')
        .map((i, e) => {
            if (i < 2) {
                return null;
            }
            const c = load(e, { decodeEntities: false });
            return {
                title: c('td:nth-child(1)').text(),
                description: art(path.join(__dirname, 'templates/historyDes.art'), {
                    fcer: c('td:nth-child(2)').text(),
                    pmc: c('td:nth-child(3)').text(),
                    exrt: c('td:nth-child(4)').text(),
                    mc: c('td:nth-child(5)').text(),
                    time: c('td:nth-child(6)').text(),
                }),
            };
        })
        .get();
    items.pop();

    const ret = {
        title: '中国光大银行',
        description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
        link: `https://www.cebbank.com/site/ygzx/whpj/rmbwhpjlspj/index.html?currcode=${TYPE[type].id}`,
        item: items,
    };
    ctx.set('json', ret);
    return ret;
}
