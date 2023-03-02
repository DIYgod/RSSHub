/* Removed due to news.gdut.edu.cn no longer exists.

const got = require('@/utils/got');
const cheerio = require('cheerio');

const site = 'http://news.gdut.edu.cn';

async function getCookie() {
    const login = '/UserLogin.aspx';
    // 获取登录页面
    const loginResp = await got({
        method: 'get',
        url: site + login,
    });

    // 获取cookie
    let cookie = '';
    if (loginResp.headers['set-cookie'] !== undefined) {
        loginResp.headers['set-cookie'].forEach((element) => {
            cookie += element.split(';')[0] + ';';
        });
    }

    const postdata = {
        ctl00$ContentPlaceHolder1$userEmail: 'gdutnews',
        ctl00$ContentPlaceHolder1$userPassWord: 'newsgdut',
        ctl00$ContentPlaceHolder1$CheckBox1: 'on',
        ctl00$ContentPlaceHolder1$Button1: '登录',
    };

    const $ = cheerio.load(loginResp.data);
    $('input[type=hidden]').each((index, element) => {
        postdata[$(element).attr('name')] = $(element).attr('value');
    });

    // 登录
    await got({
        method: 'post',
        url: site + login,
        headers: {
            Cookie: cookie,
            Referer: site + login,
        },
        form: postdata,
    }).catch((e) => {
        if (e.statusCode === 302) {
            if (/UserLogin/.test(e.headers.location)) {
                throw '新闻网登录失败';
            }
        } else {
            throw e;
        }
    });
    return cookie;
}

module.exports = async (ctx) => {
    const page = '/ArticleList.aspx?category=4';

    // 缓存cookie
    let cookie = await ctx.cache.get(site + page);
    if (!cookie) {
        cookie = await getCookie();
        ctx.cache.set(site + page, cookie);
    }

    let pageResp = await got({
        method: 'get',
        url: site + page,
        headers: {
            Cookie: cookie,
        },
    }).catch(async (e) => {
        // cookie 失效了
        if (e.statusCode === 302) {
            if (/UserLogin/.test(e.headers.location)) {
                cookie = await getCookie();
                ctx.cache.set(site + page, cookie);
                pageResp = await got({
                    method: 'get',
                    url: site + page,
                    headers: {
                        Cookie: cookie,
                    },
                });
            } else if (/waf_verify/.test(e.headers.location)) {
                throw '访问量过大，触发验证码';
            } else {
                throw e;
            }
        } else {
            throw e;
        }
    });

    // 解析列表数据
    const articleList = [];
    const $ = cheerio.load(pageResp.data);
    $('#ContentPlaceHolder1_ListView1_ItemPlaceHolderContainer p a').each((index, element) => {
        let url = $(element).attr('href');
        if (url.startsWith('.')) {
            url = url.substr(1);
        }
        const title = $(element).attr('title');
        articleList.push({ title, link: site + url });
    });

    // 根据列表数据查找对应内容
    const out = await Promise.all(
        articleList.map(async (data) => {
            const link = data.link;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            // 获取数据
            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Cookie: cookie,
                },
            });

            const $ = cheerio.load(response.data);
            // 文字内容
            const content = $('#articleBody').html();
            let offset = content.indexOf('</center>'); // 删除标题
            let description = content.substr(offset + 9).trim();

            // 删除“单 位：XXXXXX”
            const startIndex = description.indexOf('单 位：') + 4;
            if (startIndex > 0 && startIndex < 50) {
                offset = description.indexOf('<br>', startIndex) + 4;
                description = description.substr(offset).trim();
            }

            // 获取文章数据
            const articleinfos = $('.articleinfos').text();
            const date = /\[发布日期:(.+?)\]/.exec(articleinfos)[1];
            const author = /\[所属部门:(.+?)\]/.exec(articleinfos)[1];
            const category = /\[文章分类:(.+?)\]/.exec(articleinfos)[1].split(' ');

            const single = {
                title: data.title,
                link,
                description,
                pubDate: new Date(date).toUTCString(),
                author,
                category,
            };
            // 将文章结果缓存
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `广东工业大学校内新闻网`,
        link: 'http://news.gdut.edu.cn',
        item: out.length > 0 ? out : articleList,
    };
};

*/
