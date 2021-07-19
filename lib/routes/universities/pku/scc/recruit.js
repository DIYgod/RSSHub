const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'zpxx';
    const arr = {
        xwrd: 'home!newsHome.action?category=12',
        tzgg: 'home!newsHome.action?category=13',
        zpxx: 'home!recruit.action?category=1&jobType=110001',
        gfjgxx: 'home!recruitList.action?category=1&jobType=110002',
        sxxx: 'home!recruitList.action?category=2',
        cyxx: 'home!newsHome.action?category=11',
    };
    const baseUrl = 'https://scc.pku.edu.cn/';
    const rootUrl = baseUrl + arr[type];

    const first_response = await got.get(baseUrl);
    const headers = {
        cookie: `JSESSIONID=${first_response.headers['set-cookie'].join(' ').match(/JSESSIONID=(\S+);/)[1]}`,
    };

    const list_response = await got({
        method: 'get',
        url: rootUrl,
        headers,
    });
    const $ = cheerio.load(list_response.data);

    const feed_title = $('h2.category', "div[class='main-content pku-col-9']").text();

    const list = $("div.list-wrapper div[class='item clearfix']")
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const date = parseDate(item.find('div.item-date').text());
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl),
                pubDate: timezone(date, +8),
            };
        })
        .get();

    const sorted = list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, 10);

    ctx.state.data = {
        title: `北京大学学生就业指导服务中心 - ${feed_title}`,
        link: baseUrl,
        item: await Promise.all(
            sorted.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detail_page = await got({ method: 'get', url: item.link, headers });
                        const detail = cheerio.load(detail_page.data);
                        const route = detail('script', 'div#content-div').html().match(/\$\("#content-div"\).load\("(\S+)"\)/)[1];
                        const content = await got({ method: 'get', url: new URL(route, baseUrl), headers });
                        item.description = content.data;
                        return item;
                    })
            )
        ),
    };
};
