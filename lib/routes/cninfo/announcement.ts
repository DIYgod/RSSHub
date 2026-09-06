import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/announcement/:column/:code/:orgId/:category?/:search?',
    categories: ['finance'],
    example: '/cninfo/announcement/szse/000002/gssz0000002/category_ndbg_szsh',
    parameters: {
        column: 'szse 深圳证券交易所; sse 上海证券交易所; third 新三板; hke 港股; fund 基金',
        code: '股票或基金代码',
        orgId: 'orgId 组织 id',
        category: '公告分类，A 股及新三板，见下表，默认为全部',
        search: '标题关键字，默认为空',
    },
    name: '公告',
    maintainers: ['LogicJake', 'hillerliao', 'laampui', 'nczitzk'],
    description: `column 为 szse 或 sse 时可选的 category:

| 全部 | 年报                 | 半年报                | 一季报                | 三季报                | 业绩预告                | 权益分派                 | 董事会                | 监事会                | 股东大会             | 日常经营             | 公司治理             | 中介报告           | 首发               | 增发               | 股权激励             | 配股               | 解禁               | 公司债               | 可转债               | 其他融资             | 股权变动             | 补充更正             | 澄清致歉             | 风险提示             | 特别处理和退市         | 退市整理期            |
| ---- | -------------------- | --------------------- | --------------------- | --------------------- | ----------------------- | ------------------------ | --------------------- | --------------------- | -------------------- | -------------------- | -------------------- | ------------------ | ------------------ | ------------------ | -------------------- | ------------------ | ------------------ | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | ---------------------- | --------------------- |
| all  | category\\_ndbg\\_szsh | category\\_bndbg\\_szsh | category\\_yjdbg\\_szsh | category\\_sjdbg\\_szsh | category\\_yjygjxz\\_szsh | category\\_qyfpxzcs\\_szsh | category\\_dshgg\\_szsh | category\\_jshgg\\_szsh | category\\_gddh\\_szsh | category\\_rcjy\\_szsh | category\\_gszl\\_szsh | category\\_zj\\_szsh | category\\_sf\\_szsh | category\\_zf\\_szsh | category\\_gqjl\\_szsh | category\\_pg\\_szsh | category\\_jj\\_szsh | category\\_gszq\\_szsh | category\\_kzzq\\_szsh | category\\_qtrz\\_szsh | category\\_gqbd\\_szsh | category\\_bcgz\\_szsh | category\\_cqdq\\_szsh | category\\_fxts\\_szsh | category\\_tbclts\\_szsh | category\\_tszlq\\_szsh |

column 为 third 时可选的 category:

| 全部 | 临时公告       | 定期公告       | 中介机构公告   | 持续信息披露   | 首次信息披露   |
| ---- | -------------- | -------------- | -------------- | -------------- | -------------- |
| all  | category\\_lsgg | category\\_dqgg | category\\_zjjg | category\\_cxpl | category\\_scpl |

::: tip
需要筛选多个 category 时，应使用 \`;\` 将多个字段连接起来。

如 “年报 + 半年报” 即 \`category_ndbg_szsh;category_bndbg_szsh\`
:::`,
    handler,
};

const plateMap = {
    szse: 'sz',
    sse: 'sh',
    third: 'neeq',
    hke: 'hke',
    fund: 'fund',
};

async function handler(ctx: Context) {
    const { column, code, orgId, category = 'all', search: searchKey = '' } = ctx.req.param();
    const plate = plateMap[column] ?? '';

    const url = `http://www.cninfo.com.cn/new/disclosure/stock?stockCode=${code}&orgId=${orgId}`;
    const apiUrl = 'http://www.cninfo.com.cn/new/hisAnnouncement/query';

    const data = await ofetch(apiUrl, {
        method: 'POST',
        headers: {
            Referer: url,
        },
        body: new URLSearchParams({
            stock: `${code},${orgId}`,
            tabName: 'fulltext',
            pageSize: '30',
            pageNum: '1',
            column,
            category: category === 'all' ? '' : category,
            plate,
            seDate: '',
            searchkey: searchKey,
            secid: '',
            sortName: '',
            sortType: '',
            isHLtitle: 'true',
        }),
    });

    const announcementsList = data.announcements;

    return {
        title: `${announcementsList.at(-1)?.secName ?? ''}公告-巨潮资讯`,
        link: url,
        item: announcementsList.map((item) => {
            const announcementTime = parseDate(item.announcementTime).toISOString().slice(0, 10);

            return {
                title: item.announcementTitle,
                link: `http://www.cninfo.com.cn/new/disclosure/detail?plate=${plate}&orgId=${orgId}&stockCode=${code}&announcementId=${item.announcementId}&announcementTime=${announcementTime}`,
                pubDate: parseDate(item.announcementTime),
            };
        }),
    };
}
