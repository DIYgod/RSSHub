const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'http://www.mztoday.gov.cn';
const basicInfoDict = {
    zx: {
        name: '最新',
        url: '/news.html?page=',
    },
    tj: {
        name: '推荐',
        url: '/list/42.html?page=',
    },
    sz: {
        name: '时政',
        url: '/list/39.html?page=',
    },
    jy: {
        name: '教育',
        url: '/list/40.html?page=',
    },
    ms: {
        name: '民生',
        url: '/list/41.html?page=',
    },
    wl: {
        name: '文旅',
        url: '/list/41.html?page=',
    },
    jj: {
        name: '经济',
        url: '/list/53.html?page=',
    },
    wwcj: {
        name: '文明创建',
        url: '/list/54.html?page=',
    },
    bxsh: {
        name: '文明创建',
        url: '/list/55.html?page=',
    },
    bm: {
        name: '部门',
        url: '/list/56.html?page=',
    },
    zj: {
        name: '镇（街道）',
        url: '/list/57.html?page=',
    },
    jkmz: {
        name: '健康绵竹',
        url: '/list/59.html?page=',
    },
    nxjt: {
        name: '南轩讲堂',
        url: '/list/70.html?page=',
    },
    sp: {
        name: '视频',
        url: '/vlist.html?page=',
    },
    wmsj: {
        name: '文明实践',
        url: '/list/71.html?page=',
    },
    lhzg: {
        name: '领航中国',
        url: '/list/74.html?page=',
    },
    mznh: {
        name: '绵竹年画',
        url: '/list/36.html?page=',
    },
    mzls: {
        name: '绵竹历史',
        url: '/list/16.html?page=',
    },
    mzly: {
        name: '绵竹旅游',
        url: '/list/37.html?page=',
    },
    wwkmz: {
        name: '外媒看绵竹',
        url: '/list/50.html?page=',
    },
};

const getInfoUrlList = async (url) => {
    const infoUrlList = [];
    const expectToday = new Date();
    for (let pageNum = 1; ; pageNum++) {
        let response;
        try {
            // eslint-disable-next-line no-await-in-loop
            response = await got(`${url}${pageNum}`);
        } catch (err) {
            // eslint-disable-next-line no-await-in-loop
            response = await got(`${url}${pageNum}`, { dnsLookupIpVersion: 'ipv6' });
        }
        const $ = cheerio.load(response.data);
        const infoList = $('div.sl');
        // 判断当前页是否有数据
        if (infoList.length !== 0) {
            for (let infoIdx = 0; infoIdx < infoList.length; infoIdx++) {
                const date = parseDate($('div > div:nth-child(4)', infoList[infoIdx]).html().trim());
                // 判断当前信息日期是否是今日
                if (date.getUTCFullYear() === expectToday.getUTCFullYear() && date.getUTCMonth() === expectToday.getUTCMonth() && date.getUTCDate() === expectToday.getUTCDate() - 1) {
                    infoUrlList.push({
                        title: $('a', infoList[infoIdx]).attr('title'),
                        url: `${rootUrl}${$('a', infoList[infoIdx]).attr('href')}`,
                    });
                } else {
                    return infoUrlList;
                }
            }
        } else {
            return infoUrlList;
        }
    }
};

// 获取信息正文内容
const getInfoContent = (ctx, item) =>
    ctx.cache.tryGet(item.url, async () => {
        let response;
        try {
            response = await got(item.url);
        } catch (err) {
            response = await got(item.url, { dnsLookupIpVersion: 'ipv6' });
        }
        const $ = cheerio.load(response.data);
        return {
            title: item.title,
            pubDate: parseDate(Date()),
            content: $('td:nth-child(2)').html(),
            link: item.url,
        };
    });

module.exports = async (ctx) => {
    const infoType = ctx.params.infoType || 'zx';
    const infoBasicUrl = `${rootUrl}${basicInfoDict[infoType].url}`;
    const infoUrlList = await getInfoUrlList(infoBasicUrl);
    const items = await Promise.all(infoUrlList.map((item) => getInfoContent(ctx, item)));

    ctx.state.data = {
        title: `今日绵竹-${basicInfoDict[infoType].name}`,
        link: `${infoBasicUrl}1`,
        item: items.map((item) => ({
            title: item.title,
            description: art(path.resolve(__dirname, './templates/mztoday.art'), { item }),
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
