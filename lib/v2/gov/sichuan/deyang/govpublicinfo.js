const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

// 各地区url信息
const basicInfoDict = {
    绵竹市: {
        rootUrl: 'https://www.mz.gov.cn',
        infoType: {
            fdzdnr: {
                basicUrl: 'https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=15971&cur_page=',
                name: '法定主动内容',
            },
            gsgg: {
                basicUrl: 'https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=24186&cur_page=',
                name: '公示公告',
            },
        },
    },
};

const getInfoUrlList = async (rootUrl, infoBasicUrl) => {
    const infoUrlList = [];
    const expectToday = new Date();
    let notTodayCount = 0;
    for (let pageNum = 1; ; pageNum++) {
        let response;
        try {
            // eslint-disable-next-line no-await-in-loop
            response = await got(`${infoBasicUrl}${pageNum}`);
        } catch (err) {
            // eslint-disable-next-line no-await-in-loop
            response = await got(`${infoBasicUrl}${pageNum}`, { dnsLookupIpVersion: 'ipv6' });
        }
        const $ = cheerio.load(response.data);
        // 非当前日期文章计数，部分旧文章可能会置顶，目前为发现置顶数超过10
        const infoList = $('body > div.container > div.ewb-white > div.ewb-job > ul > li');
        // 判断当前页是否有数据
        if (infoList.length !== 0) {
            for (let infoIdx = 0; infoIdx < infoList.length; infoIdx++) {
                const date = parseDate($('span', infoList[infoIdx]).html());
                // 判断当前信息日期是否是今日
                if (date.getUTCFullYear() === expectToday.getUTCFullYear() && date.getUTCMonth() === expectToday.getUTCMonth() && date.getUTCDate() === expectToday.getUTCDate() - 1) {
                    infoUrlList.push({
                        title: $('a', infoList[infoIdx]).attr('title'),
                        url: `${rootUrl}${$('a', infoList[infoIdx]).attr('href')}`,
                    });
                } else {
                    notTodayCount++;
                    if (notTodayCount >= 10) {
                        return infoUrlList;
                    }
                }
            }
        } else {
            return infoUrlList;
        }
    }
};

// 获取信息正文内容
const getInfoContent = (ctx, rootUrl, item) =>
    ctx.cache.tryGet(item.url, async () => {
        let response;
        try {
            response = await got(item.url);
        } catch (err) {
            response = await got(item.url, { dnsLookupIpVersion: 'ipv6' });
        }
        // 部分网页会跳转其他类型网站,则不解析，直接附超链接
        try {
            const $ = cheerio.load(response.data);
            const fileNodes = $('#symbol > div:nth-child(4) > div > span > a');
            const fileList = [];
            for (let i = 0; i < fileNodes.length; i++) {
                fileList.push({
                    name: $(fileNodes[i]).text(),
                    url: `${rootUrl}/${$(fileNodes[i]).attr('href')}`,
                });
            }
            const rawDate = $('#symbol > div:nth-child(1) > div:nth-child(3)').text().split('：')[1].trim();
            return {
                title: $('#main').text().trim(),
                id: $('#symbol > div:nth-child(1) > div:nth-child(1)').text().split('：')[1].trim(),
                infoNum: $('#symbol > div:nth-child(1) > div:nth-child(2) > span').text().split('：')[1].trim(),
                pubDate: parseDate(rawDate),
                date: rawDate,
                keyWord: $('#symbol > div:nth-child(2) > div:nth-child(3)').text().split('：')[1].trim(),
                source: $('#symbol > div:nth-child(2) > div:nth-child(2)').text().split('：')[1].trim(),
                content: $('#container > div.ewb-white > div.ewb-article-detail').html(),
                file: fileList,
                link: item.url,
                _isCompleteInfo: true,
            };
        } catch (err) {
            return {
                title: item.title,
                pubDate: Date(),
                link: item.url,
                _isCompleteInfo: false,
            };
        }
    });

module.exports = async (ctx) => {
    const countyName = ctx.params.countyName;
    const infoType = ctx.params.infoType || 'fdzdnr';
    const infoBasicUrl = basicInfoDict[countyName].infoType[infoType].basicUrl;
    const rootUrl = basicInfoDict[countyName].rootUrl;
    const infoUrlList = await getInfoUrlList(rootUrl, infoBasicUrl);
    const items = await Promise.all(infoUrlList.map((item) => getInfoContent(ctx, rootUrl, item)));

    ctx.state.data = {
        title: `政府公开信息-${countyName}-${basicInfoDict[countyName].infoType[infoType].name}`,
        link: infoBasicUrl,
        item: items.map((item) => ({
            title: item.title,
            description: art(path.resolve(__dirname, './templates/govPublicInfo.art'), { item }),
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
