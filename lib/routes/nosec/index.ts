import { Route } from '@/types';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const baseUrl = 'https://nosec.org/home/ajaxindexdata';
const keykinds = {
    threaten: '威胁情报',
    security: '安全动态',
    hole: '漏洞预警',
    leakage: '数据泄露',
    speech: '专题报告',
    skill: '技术分析',
    tool: '安全工具',
};

export const route: Route = {
    path: '/:keykind?',
    categories: ['programming'],
    example: '/nosec/hole',
    parameters: { keykind: '对应文章分类' },
    name: 'Posts',
    maintainers: ['hellodword'],
    description: `| 分类     | 标识       |
  | :------- | :--------- |
  | 威胁情报 | \`threaten\` |
  | 安全动态 | \`security\` |
  | 漏洞预警 | \`hole\`     |
  | 数据泄露 | \`leakage\`  |
  | 专题报告 | \`speech\`   |
  | 技术分析 | \`skill\`    |
  | 安全工具 | \`tool\`     |`,
    handler,
    radar: [
        {
            source: ['nosec.org/home/index/:keykind', 'nosec.org/home/index'],
            target: (params) => `/nosec${params.keykind ? `/${params.keybind.replace('.html', '')}` : ''}`,
        },
    ],
};

async function handler(ctx) {
    const csrfresponse = await ofetch.raw('https://nosec.org/home/index');
    const $ = load(csrfresponse._data);
    const token = $('meta[name="csrf-token"]').attr('content');
    const cookies = csrfresponse.headers.getSetCookie().toString();
    const xsrf_token = cookies.match(/XSRF-TOKEN=[^\s;]+/)[0];
    const laravel_session = cookies.match(/laravel_session[^\s;]+/)[0];

    const keykind = ctx.req.param('keykind') || '';
    let formdata;
    let title;
    let link;

    if (Object.hasOwn(keykinds, keykind)) {
        formdata = `keykind=${keykind}&page=1`;
        title = `NOSEC 安全讯息平台 - ${keykinds[keykind]}`;
        link = `https://nosec.org/home/index/${keykind}.html`;
    } else {
        // keykind 未知时则获取全部
        formdata = `keykind=&page=1`;
        title = `NOSEC 安全讯息平台`;
        link = `https://nosec.org/home/index`;
    }

    const response = await got({
        method: 'post',
        url: baseUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: 'application/json',
            cookie: `${xsrf_token};${laravel_session}`,
            'X-CSRF-TOKEN': token,
        },
        body: formdata,
    });

    const data = response.data.data.threatData.data;

    return {
        // 源标题
        title,
        // 源链接
        link,
        // 源说明
        description: title,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: item.summary,
            // 文章发布时间
            pubDate: new Date(item.publiced_at).toUTCString(),
            // 文章链接
            link: `https://nosec.org/home/detail/${item.id}.html`,
            author: item.username,
        })),
    };
}
