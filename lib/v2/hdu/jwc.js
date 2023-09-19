const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');

const rootUrl = 'https://jwc.hdu.edu.cn';

const categories = {
    tzgg: '通知公告',
    xjgl: '学籍管理',
    ksgl: '考试管理',
    pkxk: '排课选课',
    cjgl: '成绩管理',
    bygl: '毕业管理',
    sjjx: '实践教学',
    bysj: '毕业设计',
    sjjd: '实践基地',
    xkjs: '学科竞赛',
    zyjs: '专业建设',
    kcjs: '课程建设',
    jcjs: '教材建设',
    zhgl: '综合管理',
    xzzx: '下载中心',
    jwyx: '教务运行',
    sjjx_4555: '实践教学',
    jxjs_4556: '教学建设',
    qtxz: '其它下载',
};

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const response = await got({
        method: 'get',
        url: `${rootUrl}/${category}/list.htm`,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.news_list li').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $1 = $(item);
            const link = new URL($1.find('div.single-line a').attr('href'), rootUrl).href;

            const cache = await ctx.cache.tryGet(link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: link,
                });

                const detail = cheerio.load(detailResponse.data);

                return {
                    title: detail('h1').text(),
                    description: detail('div.info-txt').html(),
                    pubDate: new Date(
                        detail('div.sub-p div')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2}/)[0]
                    ).toUTCString(),
                    link,
                };
            });

            return cache;
        })
    );

    ctx.state.data = {
        title: `杭州电子科技大学教务处 - ${categories[category]}`,
        link: `${rootUrl}/${category}/list.htm`,
        item: items,
    };
};
