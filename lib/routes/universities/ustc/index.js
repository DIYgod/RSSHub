const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const notice_type = {
    jx: { title: '中国科学技术大学 - 教学类通知', url: 'https://ustc.edu.cn/tzgg/jxltz.htm' },
    ky: { title: '中国科学技术大学 - 科研类通知', url: 'https://ustc.edu.cn/tzgg/kyltz.htm' },
    gl: { title: '中国科学技术大学 - 管理类通知', url: 'https://ustc.edu.cn/tzgg/glltz.htm' },
    fw: { title: '中国科学技术大学 - 服务类通知', url: 'https://ustc.edu.cn/tzgg/fwltz.htm' },
};

// 对防抓的措施
async function getCookie(ctx) {
    const cache_key = `ustc-cookie-${new Date().toLocaleDateString()}`;
    const cached_cookie = await ctx.cache.get(cache_key);
    if (cached_cookie) {
        return cached_cookie;
    }
    const { headers } = await got.get('https://ustc.edu.cn/system/resource/code/datainput.jsp', {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36' },
    });
    const cookie = headers['set-cookie']
        .filter((c) => c.match(/(user_trace_token|X_HTTP_TOKEN)/))
        .map((c) => c.split(';')[0])
        .join('; ');
    ctx.cache.set(cache_key, cookie);
    return cookie;
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'gl';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            cookie: await getCookie(ctx),
        },
        url: notice_type[type].url,
    });

    const $ = cheerio.load(response.data);
    const list = $('table[portletmode=simpleList] > tbody > tr')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: $(child[1]).find('a').text(),
                link: $(child[1]).find('a').attr('href'),
                date: new Date($(child[2]).text()).toUTCString(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list
            .filter((item) => item.link)
            .map(async (item) => {
                const itemUrl = url.resolve(notice_type[type].url, item.link);
                if (itemUrl.includes('tzggcontent.jsp') || itemUrl.includes('.ustc.edu.cn')) {
                    const single = {
                        title: item.title,
                        link: itemUrl,
                        description: item.title,
                        pubDate: item.date,
                    };
                    return Promise.resolve(single);
                } else {
                    const cache = await ctx.cache.get(itemUrl);
                    if (cache) {
                        return Promise.resolve(JSON.parse(cache));
                    }
                    const response = await got.get(itemUrl);
                    const $ = cheerio.load(response.data);
                    const single = {
                        title: $('td[class=title] > span').text(),
                        link: itemUrl,
                        description: $('td[class=content]').html(),
                        pubDate: item.date,
                    };
                    ctx.cache.set(itemUrl, JSON.stringify(single));
                    return Promise.resolve(single);
                }
            })
    );

    ctx.state.data = {
        title: notice_type[type].title,
        description: notice_type[type].title,
        link: notice_type[type].url,
        item: out,
    };
};
