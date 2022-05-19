const got = require('@/utils/got');
const cheerio = require('cheerio');
function load(link, ctx) {
    return ctx.cache.tryGet(link, async () => {
        // 开始加载页面
        const response = await got.get(link);
        const $ = cheerio.load(response.data);
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

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const host = `http://${type}.neea.edu.cn${typeDic[type].url}`;
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $(`#ReportIDname > a`).parent().parent().get();

    const process = await Promise.all(
        list.map(async (item) => {
            const ReportIDname = $(item).find('#ReportIDname > a');
            const ReportIDIssueTime = $(item).find('#ReportIDIssueTime');
            const itemUrl = `http://${type}.neea.edu.cn` + $(ReportIDname).attr('href');
            let time = new Date(ReportIDIssueTime.text()).getTime();
            time += new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000; // beijing timezone
            const single = {
                title: $(ReportIDname).text(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date(time).toUTCString(),
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `${typeDic[String(type)].title}动态`,
        link: host,
        description: `${typeDic[String(type)].title}动态 `,
        item: process,
    };
};

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
    // 社会证书考试
    cet: {
        url: '/html1/category/16093/1124-1.htm',
        title: '全国四六级（CET）',
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
        title: '全国英语等级考试 (PETS)',
    },
    wsk: {
        url: '/html1/category/1507/1646-1.htm',
        title: '全国外语水平考试 (WSK)',
    },
    ccpt: {
        url: '/html1/category/1507/2035-1.htm',
        title: '书画等级考试 (CCPT)',
    },
    mets: {
        url: '/html1/category/1507/2065-1.htm',
        title: '医护英语水平考试 (METS)',
    },
};
