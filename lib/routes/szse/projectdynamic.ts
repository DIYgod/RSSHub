// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const typeMap = {
        1: 'IPO',
        2: '再融资',
        3: '重大资产重组',
    };

    const stageMap = {
        10: '受理',
        20: '问询',
        30: '上市委会议',
        35: '提交注册',
        40: '注册结果',
        50: '中止',
        60: '终止',
    };

    const statusMap = {
        20: '新受理',
        30: '已问询',
        45: '通过',
        44: '未通过',
        46: '暂缓审议',
        56: '复审通过',
        54: '复审不通过',
        60: '提交注册',
        70: '注册生效',
        74: '不予注册',
        78: '补充审核',
        76: '终止注册',
        80: '中止',
        90: '审核不通过',
        95: '撤回',
    };

    const type = ctx.req.param('type') ?? '1';
    const stage = ctx.req.param('stage') ?? '0';
    const status = ctx.req.param('status') ?? '0';

    const rootUrl = 'http://listing.szse.cn';
    const apiUrl = `${rootUrl}/api/ras/projectrends/query?bizType=${type}${stage === '0' ? '' : `&stage=${stage}`}${status === '0' ? '' : `&status=${status}`}&pageIndex=0&pageSize=20`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.map((item) => ({
        title: item.prjid,
        link: `${rootUrl}/api/ras/projectrends/details?id=${item.prjid}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const data = detailResponse.data.data;
                const current = JSON.parse(data.pjdot)['-1'];

                item.link = `${rootUrl}/projectdynamic/ipo/detail/index.html?id=${item.title}`;
                item.title = `[${data.prjst}] ${data.cmpnm} (${data.cmpsnm})- ${data.csrcind}`;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    data,
                    current,
                });

                item.pubDate = timezone(parseDate(current.startTime, 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${typeMap[type]}项目动态${status === '0' ? (stage === '0' ? '' : ` (${stageMap[stage]}) `) : ` (${statusMap[status]}) `} - 创业板发行上市审核信息公开网站 - 深圳证券交易所`,
        link: `${rootUrl}/projectdynamic/${type}/index.html`,
        item: items,
    });
};
