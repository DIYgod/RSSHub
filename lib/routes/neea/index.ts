import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function loadContent(link) {
    return cache.tryGet(link, async () => {
        // 开始加载页面
        const response = await got.get(link);
        const $ = load(response.data);
        // 获取标题
        const title = $('#Content1 > div > ul > li > h1').text();
        // 获取正文内容
        const introduce = $('#ReportIDtext').html();

        return {
            title,
            description: introduce,
            link,
        };
    });
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const host = `https://${type}.neea.edu.cn${typeDic[type].url}`;
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.data;

    const $ = load(data);
    const list = $(`#ReportIDname > a`).parent().parent().toArray();

    const process = await Promise.all(
        list.map(async (item) => {
            const ReportIDname = $(item).find('#ReportIDname > a');
            const ReportIDIssueTime = $(item).find('#ReportIDIssueTime');
            const itemUrl = `https://${type}.neea.edu.cn` + $(ReportIDname).attr('href');
            const time = ReportIDIssueTime.text();
            const single = {
                title: $(ReportIDname).text(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: timezone(parseDate(time), +8),
            };
            const other = await loadContent(String(itemUrl));
            return Object.assign({}, single, other);
        })
    );
    return {
        title: `${typeDic[String(type)].title}动态`,
        link: host,
        description: `${typeDic[String(type)].title}动态 `,
        item: process,
    };
}

const typeDic = {
    // 国家教育考试
    gaokao: {
        url: '/html1/category/1507/1945-1.htm',
        title: '普通高考',
    },
    chengkao: {
        url: '/html1/category/1507/1960-1.htm',
        title: '成人高考',
    },
    yankao: {
        url: '/html1/category/1507/2005-1.htm',
        title: '研究生考试',
    },
    zikao: {
        url: '/html1/category/1508/1403-1.htm',
        title: '自学考试',
    },
    ntce: {
        url: '/html1/category/1507/1148-1.htm',
        title: '中小学教师资格考试',
    },
    tdxl: {
        url: '/html1/category/2210/313-1.htm',
        title: '同等学力申请硕士学位考试',
    },
    // 社会证书考试
    cet: {
        url: '/html1/category/16093/1124-1.htm',
        title: '全国四六级考试（CET）',
    },
    ncre: {
        url: '/html1/category/1507/872-1.htm',
        title: '全国计算机等级考试（NCRE）',
    },
    nit: {
        url: '/html1/category/1507/1630-1.htm',
        title: '全国计算机应用水平考试（NIT）',
    },

    pets: {
        url: '/html1/category/1507/1570-1.htm',
        title: '全国英语等级考试（PETS）',
    },
    wsk: {
        url: '/html1/category/1507/1646-1.htm',
        title: '全国外语水平考试（WSK）',
    },
    ccpt: {
        url: '/html1/category/1507/2035-1.htm',
        title: '书画等级考试（CCPT）',
    },
};

export const route: Route = {
    path: '/local/:type',
    name: '国内考试动态',
    url: 'www.neea.edu.cn',
    maintainers: ['SunShinenny'],
    example: '/neea/local/cet',
    parameters: { type: '考试项目，见下表' },
    categories: ['study'],
    features: {
        supportRadar: true,
    },
    radar: Object.entries(typeDic).map(([type, value]) => ({
        title: `${value.title}动态`,
        source: [`${type}.neea.edu.cn`, `${type}.neea.cn`],
        target: `/local/${type}`,
    })),
    handler,
    description: `|              | 考试项目                      | type     |
| ------------ | ----------------------------- | -------- |
| 国家教育考试 | 普通高考                      | gaokao   |
|              | 成人高考                      | chengkao |
|              | 研究生考试                    | yankao   |
|              | 自学考试                      | zikao    |
|              | 中小学教师资格考试            | ntce     |
|              | 同等学力申请硕士学位考试      | tdxl     |
| 社会证书考试 | 全国四六级考试（CET）         | cet      |
|              | 全国计算机等级考试（NCRE）    | ncre     |
|              | 全国计算机应用水平考试（NIT） | nit      |
|              | 全国英语等级考试（PETS）      | pets     |
|              | 全国外语水平考试（WSK）       | wsk      |
|              | 书画等级考试（CCPT）          | ccpt     |`,
};
