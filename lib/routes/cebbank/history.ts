// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import * as path from 'node:path';
import { art } from '@/utils/render';
const utils = require('./utils');

const { TYPE } = utils;

export default async (ctx) => {
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
    ctx.set('data', {
        title: '中国光大银行',
        description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
        link: `https://www.cebbank.com/site/ygzx/whpj/rmbwhpjlspj/index.html?currcode=${TYPE[type].id}`,
        item: items,
    });

    ctx.set('json', {
        title: '中国光大银行',
        description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
        item: items,
    });
};
