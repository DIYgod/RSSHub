const got = require('@/utils/got');
const cheerio = require('cheerio');

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

module.exports = async (ctx) => {
    const csrfresponse = await got.get('https://nosec.org/home/index');
    const $ = cheerio.load(csrfresponse.data);
    const token = $('meta[name="csrf-token"]').attr('content');
    const cookies = csrfresponse.headers['set-cookie'].toString();
    const xsrf_token = cookies.match(/XSRF-TOKEN=[^;\s]+/)[0];
    const laravel_session = cookies.match(/laravel_session[^;\s]+/)[0];

    const keykind = ctx.params.keykind || '';
    let formdata;
    let title;
    let link;

    if (keykinds.hasOwnProperty(keykind)) {
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
        data: formdata,
    });

    const data = response.data.data.threatData.data;

    ctx.state.data = {
        // 源标题
        title: title,
        // 源链接
        link: link,
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
};
