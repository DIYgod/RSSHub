const got = require('@/utils/got');
const wwwid_key = 'kuaidi100-wwwid';
const csrf_key = 'kuaidi100-csrf';
const globacsrftoken_key = 'kuaidi100-globacsrftoken';
const dasddocTitl_key = 'kuaidi100-dasddocTitl';
const dasddocReferrer_key = 'kuaidi100-dasddocReferrer';
const dasddocHref_key = 'kuaidi100-dasddocHref';
const query_count = 'kuaidi100-cookie-count';
const max_query_count = 30;

async function getCookie(ctx) {
    // Check if this key should be replace? every 30 times should be fine.
    shouldUpdateCookie(ctx);
    let wwwid = await ctx.cache.get(wwwid_key);
    let csrf = await ctx.cache.get(csrf_key);
    let globacsrftoken = await ctx.cache.get(globacsrftoken_key);
    let dasddocTitl = await ctx.cache.get(dasddocTitl_key);
    let dasddocReferrer = await ctx.cache.get(dasddocReferrer_key);
    let dasddocHref = await ctx.cache.get(dasddocHref_key);
    if (!wwwid || !csrf || !dasddocTitl || !dasddocReferrer || !dasddocHref) {
        const indexResponse = await got({
            method: 'get',
            url: 'https://www.kuaidi100.com/?from=appstore',
            headers: {
                // App store
                Referer: 'https://apps.apple.com/cn/app/%E5%BF%AB%E9%80%92100-%E5%8F%8C11%E5%AF%84%E4%BB%B6%E9%80%80%E8%B4%A7-%E4%B8%8A%E5%BF%AB%E9%80%92100/id458270120',
            },
        });
        const set_cookie = indexResponse.headers['set-cookie'];
        if (set_cookie) {
            for (const e of set_cookie) {
                if (e.indexOf('WWWID') === 0) {
                    wwwid = e.split(';')[0];
                } else if (e.indexOf('csrftoken') === 0) {
                    csrf = e.split(';')[0];
                } else if (e.indexOf('globacsrftoken') === 0) {
                    globacsrftoken = e.split(';')[0];
                } else if (e.indexOf('dasddocTitle') >= 0) {
                    dasddocTitl = e.split(';')[0];
                } else if (e.indexOf('dasddocReferrer') >= 0) {
                    dasddocReferrer = e.split(';')[0];
                } else if (e.indexOf('dasddocHref') >= 0) {
                    dasddocHref = e.split(';')[0];
                }
            }
        }

        ctx.cache.set(wwwid_key, wwwid, 600);
        ctx.cache.set(csrf_key, csrf, 600);
        ctx.cache.set(globacsrftoken_key, globacsrftoken, 600);
        ctx.cache.set(dasddocTitl_key, dasddocTitl, 600);
        ctx.cache.set(dasddocReferrer_key, dasddocReferrer, 600);
        ctx.cache.set(dasddocHref_key, dasddocHref, 600);
        // We have acquired new cookie. It may due to cache timeout.
        // Force update counter and don't wait it finished.
        shouldUpdateCookie(ctx, true);
    }

    return {
        wwwid,
        csrf,
        globacsrftoken,
        dasddocTitl,
        dasddocReferrer,
        dasddocHref,
    };
}

/*
    Example Company
    {
        "available": false,  <- 这个不知道是什么的可用性，反正不是可查询的
        "canOrder": false,
        "comTypeName": "国内运输商",
        "contactTel": "626-818-2750",
        "createTime": 1486202888000,
        "hasNetwork": false,
        "id": 7172420,
        "name": "金岸物流",
        "number": "jinan",
        "shortName": "金岸物流",
        "shortNumber": "jinan",
        "siteUrl": "http://www.gpl-express.com/",
        "type": 0,
        "version": 776
    }
*/
function getCompanyList(ctx) {
    // Using date as cache key and it will automatically expired by 1d
    const key = `kuaidi100-company-name-${new Date().toISOString().split('T')[0]}`;
    return ctx.cache.tryGet(key, async () => {
        const cookie = await getCookie(ctx);
        const wwwid = cookie.wwwid;
        const companyResponse = await got({
            method: 'post',
            url: 'https://www.kuaidi100.com/company.do?method=js&t=201701051440',
            headers: {
                Referer: 'https://www.kuaidi100.com/',
                Cookie: wwwid,
            },
        });
        let list = companyResponse.body;

        // Parsing the js file
        try {
            list = list.substr(12).replace(/};/g, '}').replace(/'/g, '"');
            list = JSON.parse(list);
            list = list.company;
        } catch (e) {
            throw new Error('无法正确获取快递公司列表：请稍后重试');
        }

        return list;
    });
}

function shouldUpdateCookie(ctx, forcedUpdate = false) {
    if (forcedUpdate) {
        ctx.cache.set(query_count, 0);
    } else {
        const count = ctx.cache.get(query_count);
        if (!count) {
            ctx.cache.set(query_count, 1);
        } else {
            if (count > max_query_count) {
                ctx.cache.set(query_count, 0);
                clearCookie(ctx);
            } else {
                ctx.cache.set(query_count, count + 1);
            }
        }
    }
}

function clearCookie(ctx) {
    ctx.cache.set(wwwid_key, null);
    ctx.cache.set(csrf_key, null);
}

module.exports = {
    company: (ctx) => getCompanyList(ctx),
    checkCode: async (ctx, number, id, phone) => {
        const list = await getCompanyList(ctx);
        const company = list.find((c) => c.number === number);
        if (!company) {
            return {
                status: false,
                message: '快递公司编号不受支持！',
                company: {
                    name: '未知',
                },
            };
        } else {
            if (number.indexOf('shunfeng') !== -1 && !isNaN(phone) && String(phone).length !== 4) {
                return {
                    status: false,
                    message: '顺丰查询需要手机号后四位！',
                    company,
                };
            } else if (company.checkReg) {
                return {
                    status: true,
                    regex: new RegExp(company.checkReg).test(id),
                    company,
                };
            } else {
                return {
                    status: true,
                    regex: undefined,
                    company,
                };
            }
        }
    },

    /*
      Example Query
      {
          "message": "ok",
          "nu": "73123917441103",
          "ischeck": "1",
          "condition": "F00",
          "com": "zhongtong",
          "status": "200",
          "state": "3",
          "data": [{
                      "time": "2019-12-12 12:41:15",
                      "ftime": "2019-12-12 12:41:15",
                      "context": "【温州市】 快件已由【菜鸟的温州燎原华庭7栋103号店】代签收, 如有问题请电联（18581563547 / 4001787878）, 感谢您使用中通快递, 期待再次为您服务!",
                      "location": ""
                  }
                ...]
        Example failed Query
        {
            "message": "快递公司参数异常：验证码错误",
            "nu": "",
            "ischeck": "0",
            "condition": "",
            "com": "",
            "status": "408",
            "state": "0",
            "data": []
        }
    */

    getQuery: async (ctx, number, id, phone) => {
        const query_key = `kuaidi100-query-${number}-${id}`;
        let query = await ctx.cache.get(query_key);
        // 组装日期与单号 日期为提前两个月
        const timestamp = Number.parseInt(new Date().getTime() / 1000);
        const lastTowMonth = new Date().getTime() - 60 * 60 * 24 * 60 * 1000;
        const dateString = new Date(lastTowMonth).toLocaleDateString('ZH').split('/').join('');
        const queryMeta = encodeURIComponent(
            JSON.stringify({
                date: dateString,
                nums: [id],
            })
        );

        if (!query) {
            const cookie = await getCookie(ctx);
            const queryResponse = await got({
                method: 'get',
                url: `https://www.kuaidi100.com/query?type=${number}&postid=${id}&temp=${Math.random()}&phone=${phone ? phone : ''}`,
                headers: {
                    Referer: 'https://www.kuaidi100.com/',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
                    Cookie: `${cookie.globacsrftoken}; ${cookie.csrf}; ${cookie.wwwid}; ${cookie.dasddocHref}; ${cookie.dasddocReferrer}; ${
                        cookie.dasddocTitl
                    }; addcom=${number}; addnu=${id}; snt_query_meta=${queryMeta}; sortStatus=0; Hm_lpvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp}; Hm_lvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp - 1642}`,
                },
            });

            query = queryResponse.data;
            if (query.status === '200') {
                if (query.data && query.data[0].context === '查无结果') {
                    // 查无结果 appears when cookie is invaild, force update cookie.
                    clearCookie(ctx);
                    throw new Error('暂时无法获取快递信息，请稍后重试...');
                } else if (query.ischeck === '0') {
                    // Not yet complete, don't cache for now.
                    // To avoid frquent link test when add source, add 180s cache
                    ctx.cache.set(query_key, query, 180);
                } else {
                    ctx.cache.set(query_key, query); // Finished, cache id
                }
            } else {
                ctx.cache.set(query_key, query); // Error, cache as well
                throw new Error(`[${query.status}]信息有误，请重新检查后订阅：${query.message}`);
            }
        } else {
            query = JSON.parse(query);
        }

        return query;
    },
};
