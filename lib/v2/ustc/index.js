const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
// const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'windows', device: 'desktop' });

const notice_type = {
    jx: { title: '中国科学技术大学 - 教学类通知', url: 'https://ustc.edu.cn/tzgg/jxltz.htm' },
    ky: { title: '中国科学技术大学 - 科研类通知', url: 'https://ustc.edu.cn/tzgg/kyltz.htm' },
    gl: { title: '中国科学技术大学 - 管理类通知', url: 'https://ustc.edu.cn/tzgg/glltz.htm' },
    fw: { title: '中国科学技术大学 - 服务类通知', url: 'https://ustc.edu.cn/tzgg/fwltz.htm' },
};

// 对防抓的措施
// function getCookie(ctx) {
//     const cache_key = `ustc-cookie-${new Date().toLocaleDateString()}`;
//     return ctx.cache.tryGet(cache_key, async () => {
//         const { headers } = await got('https://ustc.edu.cn/system/resource/code/datainput.jsp', {
//             headers: { 'user-agent': UA },
//         });
//         const cookie = headers['set-cookie']
//             .filter((c) => c.match(/(user_trace_token|X_HTTP_TOKEN)/))
//             .map((c) => c.split(';')[0])
//             .join('; ');
//         return cookie;
//     });
// }

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'gl';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: notice_type[type].url,
    });

    const $ = cheerio.load(response.data);
    let items = $('table[portletmode=simpleList] > tbody > tr.light')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: $(child[1]).find('a').attr('title'),
                link: $(child[1]).find('a').attr('href').startsWith('../') ? new URL($(child[1]).find('a').attr('href'), notice_type[type].url).href : $(child[1]).find('a').attr('href'),
                pubDate: timezone(parseDate($(child[2]).text(), 'YYYY-MM-DD'), +8),
            };
            return info;
        })
        .get();

    items = await Promise.all(
        items
            .filter((item) => item.link)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    try {
                        const response = await got(item.link);
                        const $ = cheerio.load(response.data);

                        item.description = $('div.v_news_content').html();
                    } catch {
                        // intranet contents
                    }
                    return item;
                })
            )
    );

    ctx.state.data = {
        title: notice_type[type].title,
        description: notice_type[type].title,
        link: notice_type[type].url,
        item: items,
    };
};
