import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';

async function settleQueueRequest(request: Promise<unknown>): Promise<void> {
    try {
        await request;
    } catch {
        // The original request retains its rejection; only the serial queue is released.
        return;
    }
}

async function loadQueuedCookie() {
    await cookieQueue;
    return loadCookie();
}

const wwwidKey = 'kuaidi100-wwwid';
const csrfKey = 'kuaidi100-csrf';
const globalCsrfTokenKey = 'kuaidi100-globacsrftoken';
const dasddocTitleKey = 'kuaidi100-dasddocTitl';
const dasddocReferrerKey = 'kuaidi100-dasddocReferrer';
const dasddocHrefKey = 'kuaidi100-dasddocHref';
const queryCountKey = 'kuaidi100-cookie-count';
const maxQueryCount = 30;

let cookieQueue: Promise<unknown> = Promise.resolve();

function getCookie() {
    const request = loadQueuedCookie();
    // A failed bootstrap must not prevent later requests from trying again.
    cookieQueue = settleQueueRequest(request);
    return request;
}

async function loadCookie() {
    // Check if this key should be replace? every 30 times should be fine.
    await shouldUpdateCookie();
    let wwwid = await cache.get(wwwidKey);
    let csrf = await cache.get(csrfKey);
    let globacsrftoken = await cache.get(globalCsrfTokenKey);
    let dasddocTitl = await cache.get(dasddocTitleKey);
    let dasddocReferrer = await cache.get(dasddocReferrerKey);
    let dasddocHref = await cache.get(dasddocHrefKey);
    if (!wwwid || !csrf || !dasddocTitl || !dasddocReferrer || !dasddocHref) {
        const indexResponse = await ofetch.raw('https://www.kuaidi100.com/?from=appstore', {
            headers: {
                // App store
                Referer: 'https://apps.apple.com/cn/app/%E5%BF%AB%E9%80%92100-%E5%8F%8C11%E5%AF%84%E4%BB%B6%E9%80%80%E8%B4%A7-%E4%B8%8A%E5%BF%AB%E9%80%92100/id458270120',
            },
        });
        for (const e of indexResponse.headers.getSetCookie()) {
            switch (0) {
                case e.indexOf('WWWID'):
                    wwwid = e.split(';', 1)[0];

                    break;

                case e.indexOf('csrftoken'):
                    csrf = e.split(';', 1)[0];

                    break;

                case e.indexOf('globacsrftoken'):
                    globacsrftoken = e.split(';', 1)[0];

                    break;

                default:
                    if (e.includes('dasddocTitle')) {
                        dasddocTitl = e.split(';', 1)[0];
                    } else if (e.includes('dasddocReferrer')) {
                        dasddocReferrer = e.split(';', 1)[0];
                    } else if (e.includes('dasddocHref')) {
                        dasddocHref = e.split(';', 1)[0];
                    }
            }
        }

        await cache.set(wwwidKey, wwwid ?? '', 600);
        await cache.set(csrfKey, csrf ?? '', 600);
        await cache.set(globalCsrfTokenKey, globacsrftoken ?? '', 600);
        await cache.set(dasddocTitleKey, dasddocTitl ?? '', 600);
        await cache.set(dasddocReferrerKey, dasddocReferrer ?? '', 600);
        await cache.set(dasddocHrefKey, dasddocHref ?? '', 600);
        // We have acquired new cookie. It may due to cache timeout.
        // Reset the counter after storing the refreshed cookies.
        await shouldUpdateCookie(true);
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

function getCompanyList() {
    // Using date as cache key and it will automatically expired by 1d
    const key = `kuaidi100-company-name-${new Date().toISOString().split('T', 1)[0]}`;
    return cache.tryGet(key, async () => {
        const cookie = await getCookie();
        const wwwid = cookie.wwwid;
        const companyResponse = await got({
            method: 'post',
            url: 'https://www.kuaidi100.com/company.do?method=js&t=201701051440',
            headers: {
                Cookie: wwwid,
            },
        });
        let list = companyResponse.body;

        // Parsing the js file
        try {
            list = list.slice(12).replaceAll('};', '}').replaceAll("'", '"');
            list = JSON.parse(list);
            list = list.company;
        } catch {
            throw new Error('无法正确获取快递公司列表：请稍后重试');
        }

        return list;
    });
}

async function shouldUpdateCookie(forcedUpdate = false) {
    if (forcedUpdate) {
        await cache.set(queryCountKey, '1');
        return;
    }
    const count = Number(await cache.get(queryCountKey)) || 0;
    if (count >= maxQueryCount) {
        await cache.set(queryCountKey, '');
        await clearCookie();
    } else {
        await cache.set(queryCountKey, String(count + 1));
    }
}

async function clearCookie() {
    await Promise.all([cache.set(wwwidKey, ''), cache.set(csrfKey, '')]);
}

export default {
    company: () => getCompanyList(),
    checkCode: async (number, id, phone) => {
        const list = await getCompanyList();
        const company = list.find((c) => c.number === number);
        if (company) {
            if (number.includes('shunfeng') && !/^\d{4}$/.test(phone ?? '')) {
                return {
                    status: false,
                    message: '顺丰查询需要手机号后四位！',
                    company,
                };
            }
            if (company.checkReg) {
                const valid = new RegExp(company.checkReg).test(id);
                return {
                    status: valid,
                    message: valid ? undefined : '运单号不符合该快递公司的格式，请核对后重试。',
                    regex: valid,
                    company,
                };
            }
            return {
                status: true,
                regex: undefined,
                company,
            };
        }
        return {
            status: false,
            message: '快递公司编号不受支持！',
            company: {
                name: '未知',
            },
        };
    },

    getQuery: async (number, id, phone) => {
        const queryKey = `kuaidi100-query-${JSON.stringify([number, id, phone ?? ''])}`;
        let query: any = await cache.get(queryKey);
        // Include the ticket number and a date two months before the query.
        const timestamp = Number.parseInt(String(Date.now() / 1000));
        const twoMonthsAgo = Date.now() - 60 * 60 * 24 * 60 * 1000;
        const dateString = new Date(twoMonthsAgo).toLocaleDateString('ZH').split('/').join('');
        const queryMeta = encodeURIComponent(
            JSON.stringify({
                date: dateString,
                nums: [id],
            })
        );

        if (query) {
            query = JSON.parse(query);
        } else {
            const cookie = await getCookie();
            const queryUrl = new URL('https://www.kuaidi100.com/query');
            queryUrl.search = new URLSearchParams({ type: number, postid: id, temp: String(Math.random()), phone: phone ?? '' }).toString();
            const queryResponse = await got({
                method: 'get',
                url: queryUrl.href,
                headers: {
                    Referer: 'https://www.kuaidi100.com/',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
                    Cookie: `${cookie.globacsrftoken}; ${cookie.csrf}; ${cookie.wwwid}; ${cookie.dasddocHref}; ${cookie.dasddocReferrer}; ${
                        cookie.dasddocTitl
                    }; addcom=${encodeURIComponent(number)}; addnu=${encodeURIComponent(id)}; snt_query_meta=${queryMeta}; sortStatus=0; Hm_lpvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp}; Hm_lvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp - 1642}`,
                },
            });

            query = queryResponse.data;
            if (query.status === '200') {
                if (query.data?.[0]?.context === '查无结果') {
                    // An invalid cookie can produce this empty-result marker; refresh it for the next query.
                    await clearCookie();
                    throw new Error('暂时无法获取快递信息，请稍后重试...');
                }
                // Use a short cache duration until the parcel is complete.
                await (query.ischeck === '0' ? cache.set(queryKey, query ?? '', 180) : cache.set(queryKey, query ?? ''));
            } else {
                await cache.set(queryKey, query ?? ''); // Error, cache as well
                throw new Error(`[${query.status}]信息有误，请重新检查后订阅：${query.message}`);
            }
        }

        if (query.status !== '200') {
            throw new Error(`[${query.status}]信息有误，请重新检查后订阅：${query.message}`);
        }

        return query;
    },
};
