import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/beijing/land/:tab/:filter?/:limit?',
    categories: ['government'],
    example: '/gov/beijing/land/tdcjylb',
    parameters: { tab: 'tdcjylb: 土地成交一览表', filter: '过滤条件' },
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
            source: ['yewu.ghzrzyw.beijing.gov.cn/gwxxfb/tdsc/:tab.html', 'https://yewu.ghzrzyw.beijing.gov.cn/gwxxfb/tdsc/:tab.html'],
            target: '',
        },
    ],
    name: '北京土地拍卖信息',
    maintainers: ['sohow'],
    handler,
};

async function handler(ctx) {
    const { tab, filter = '', limit = 10 } = ctx.req.param();
    const now = Date.now();
    if (limit > 50) {
        throw new Error('limit 超过 50');
    }
    const url = `https://yewu.ghzrzyw.beijing.gov.cn/zkdncms/tdgltdsc/${tab}/esSearchList?t=${now}&page=1&limit=${limit}&landusetype1=&announcetype=&county=&gjz=&_=${now}`;
    const res = await ofetch(url, {
        headers: {
            accept: 'application/json',
        },
    });

    // 从 API 响应中提取相关数据
    const items = res.data
        .filter((item) => checkFilter(filter, item)) // 过滤逻辑
        .map((item) => ({
            // 标题
            title: item.title,
            // 链接
            link: `https://yewu.ghzrzyw.beijing.gov.cn/zkdncms/tdgltdsc/esSearchDetail/${item.id}?t=${now}&_=${now}`,
            // 正文
            description: `项目名称：${item.title} \n 项目位置：${item.landlocation} \n 项目类型：${item.landusetype1DictText} \n 成交时间：${item.chegnJiaoShiJian}`,
            guid: item.id,
            // 日期
            pubDate: parseDate(item.createDateTime),
            author: item.jingDeRen,
            category: item.landid,
        }));

    return {
        // 源标题
        title: '北京土地拍卖信息',
        // 源链接
        link: url,
        // 源文章
        item: items,
    };
}

function checkFilter(filter: string, data: Record<string, any>): boolean {
    // 如果filter为空，直接返回true
    if (!filter) {return true;}

    // 按"-"分割条件组
    const conditionGroups = filter.split('-');

    // 遍历每个条件组
    for (const group of conditionGroups) {
        // 按"_"分割条件组中的元素
        const parts = group.split('_');
        if (parts.length < 2) {continue;} // 忽略无效条件组

        const [key, ...values] = parts; // 第一个元素为key，剩余为匹配值
        const dataValue = data[key]; // 从data中获取对应值

        // 如果data中不存在该key，当前条件组不满足
        if (dataValue === undefined || dataValue === null) {return false;}

        const dataValueStr = String(dataValue); // 转换为字符串
        let matchFound = false;

        // 检查是否包含任意一个匹配值
        for (const val of values) {
            if (dataValueStr.includes(val)) {
                matchFound = true;
                break;
            }
        }

        // 当前条件组未匹配则整体不满足
        if (!matchFound) {return false;}
    }

    return true;
}
