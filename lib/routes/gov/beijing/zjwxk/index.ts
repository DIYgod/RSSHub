import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/beijing/zjwxk/:ddlYT?/:ddlQX?/:rblFWType1?',
    categories: ['government'],
    example: '/gov/beijing/zjwxk',
    parameters: { ddlQX: '所属区县', rblFWType1: '期房/现房', ddlYT: '用途' },
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
            source: ['bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307670&isTrue=1'],
            target: '',
        },
    ],
    name: '北京市住建委新建商品房预售许可公示',
    maintainers: ['sohow'],
    handler,
};

async function handler(ctx) {
    const { ddlYT = '', ddlQX = '', rblFWType1 = '' } = ctx.req.param();
    let items: any[] = [];
    let qxArray: string[] = [];

    // 处理ddlQX参数
    if (ddlQX) {
        // 分割并过滤空值
        qxArray = ddlQX.split('_').filter(Boolean);
    }

    // 如果ddlQX为空或分割后为空数组，添加空字符串
    if (qxArray.length === 0) {
        qxArray = [''];
    }

    // 并发请求所有区县数据
    const promises = qxArray.map((qx) => requestData(ddlYT, qx, rblFWType1));

    // 等待所有请求完成并合并结果
    const results = await Promise.all(promises);
    items = results.flat();

    return {
        title: '北京市住建委新建商品房预售许可公示',
        link: `http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307670&isTrue=1`,
        item: items,
    };
}

async function requestData(ddlYT: string, ddlQX: string, rblFWType1: string): Promise<any[]> {
    const baseUrl = 'http://bjjs.zjw.beijing.gov.cn';
    const url = `${baseUrl}/eportal/ui?pageId=307670&isTrue=1`;
    const data = {
        projectName: '项目名称关键字',
        rblFWType: 'q',
        txtYS: '',
        txtZH: '',
        txtCQZH: '证号关键字',
        developer: '单位名称关键字',
        txtaddress: '地址关键字',
        isTrue: '1',
        ddlQX,
        rblFWType1,
        ddlYT,
        ddlFW: '-1',
        ddlQW: '-1',
        ddlHX: '-1',
        currentPage: '1',
        pageSize: '15',
    };
    const response = await ofetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data),
    });
    const $ = load(response);

    // 从 API 响应中提取相关数据
    const items = $('#FDCJYFORM > table:nth-child(4) > tbody > tr:nth-child(2) > td > table > tbody tr')
        .toArray()
        .filter((item) => {
            item = $(item);
            const title = $(item).find('a').first().text();
            return title !== '';
        })
        .map((item) => {
            item = $(item);
            const xm = item.find('a').first();
            const nu = item.find('a').eq(1);
            const pub = item.find('td').eq(2);

            const name = xm.text();
            const title = `${name} - ${nu.text()} - ${pub.text()}`;
            return {
                title,
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: `${baseUrl}/${xm.attr('href')}`,
                pubDate: parseDate(pub.text()),
                author: nu.text(),
                guid: nu.text(),
            };
        });

    return items;
}
