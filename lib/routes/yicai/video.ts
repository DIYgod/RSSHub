import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/video/:id?',
    categories: ['traditional-media'],
    example: '/yicai/video',
    parameters: { id: '分类 id，见下表，可在对应分类页中找到，默认为视听' },
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
            source: ['yicai.com/video/:id', 'yicai.com/video'],
            target: '/video/:id',
        },
    ],
    name: '视听',
    maintainers: ['nczitzk'],
    handler,
    description: `| Id                   | 名称                         |
| -------------------- | ---------------------------- |
| youliao              | 有料                         |
| appshipin            | 此刻                         |
| yicaisudi            | 速递                         |
| caishang             | 财商                         |
| shiji                | 史记                         |
| jinrigushi           | 今日股市                     |
| tangulunjin          | 谈股论金                     |
| gongsiyuhangye       | 公司与行业                   |
| cjyxx                | 财经夜行线                   |
| 6thtradingday        | 第六交易日                   |
| cjfw                 | 财经风味                     |
| chuangshidai         | 创时代                       |
| weilaiyaoqinghan     | 未来邀请函                   |
| tounaofengbao        | 头脑风暴                     |
| zhongguojingyingzhe  | 中国经营者                   |
| shichanglingjuli     | 市场零距离                   |
| huanqiucaijing       | 环球财经视界                 |
| zgjcqyjglsxftl       | 中国杰出企业家管理思想访谈录 |
| jiemacaishang        | 解码财商                     |
| sxpl                 | 首席评论                     |
| zhongguojingjiluntan | 中国经济论坛                 |
| opinionleader        | 意见领袖                     |
| xinjinrong           | 解码新金融                   |
| diyidichan           | 第一地产                     |
| zhichedaren          | 智车达人                     |
| chuangtoufengyun     | 创投风云                     |
| chunxiangrensheng    | 醇享人生                     |
| diyishengyin         | 第一声音                     |
| sanliangboqianjin    | 财智双全                     |
| weilaiyaoqinghan     | 未来邀请函                   |
| zjdy                 | 主角 ▪ 大医                 |
| leye                 | 乐业之城                     |
| sanrenxing           | 价值三人行                   |
| yuandongli           | 中国源动力                   |
| pioneerzone          | 直击引领区                   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    let channel;
    if (id) {
        const navUrl = `${rootUrl}/api/ajax/getnavs`;

        const response = await got({
            method: 'get',
            url: navUrl,
        });

        for (const c of response.data.header.video) {
            if (c.EnglishName === id || c.ChannelID === id) {
                channel = {
                    id: c.ChannelID,
                    name: c.ChannelName,
                    slug: c.EnglishName,
                };
                break;
            }
        }
    }

    const currentUrl = `${rootUrl}/video${id ? `/${channel.slug}` : ''}`;
    const apiUrl = `${rootUrl}/api/ajax/${id ? `getlistbycid?cid=${channel.id}` : 'getjuhelist?action=video'}&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: `第一财经 - ${channel?.name ?? '视听'}`,
        link: currentUrl,
        item: items,
    };
}
