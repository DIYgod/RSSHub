const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

// 各地区url信息
const basicInfoDict = {
    绵竹市: {
        rootUrl: 'https://www.mz.gov.cn',
        infoUrl: 'https://www.mz.gov.cn/info/iList.jsp?tm_id=1805&cur_page=',
    },
};

const getInfoUrlList = async (countyName) => {
    const url = basicInfoDict[countyName].infoUrl;
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
        const infoList = $('#list_content > ul > li');
        // 判断当前页是否有数据
        if (infoList.length !== 0) {
            for (let infoIdx = 0; infoIdx < infoList.length; infoIdx++) {
                const date = parseDate($('span', infoList[infoIdx]).html());
                // 判断当前信息日期是否是今日
                if (date.getUTCFullYear() === expectToday.getUTCFullYear() && date.getUTCMonth() === expectToday.getUTCMonth() && date.getUTCDate() === expectToday.getUTCDate() - 1) {
                    infoUrlList.push(`${basicInfoDict[countyName].rootUrl}${$('a', infoList[infoIdx]).attr('href')}`);
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
const getInfoContent = async (ctx, url, countyName) =>
    await ctx.cache.tryGet(url, async () => {
        let response;
        try {
            response = await got(url);
        } catch (err) {
            response = await got(url, { dnsLookupIpVersion: 'ipv6' });
        }
        const $ = cheerio.load(response.data);
        const fileNodes = $('#symbol > div:nth-child(4) > div > span > a');
        const fileList = [];
        for (let i = 0; i < fileNodes.length; i++) {
            fileList.push({
                name: $(fileNodes[i]).text(),
                url: `${basicInfoDict[countyName].rootUrl}/${$(fileNodes[i]).attr('href')}`,
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
            link: url,
        };
    });

module.exports = async (ctx) => {
    const countyName = ctx.params.countyName;
    const infoUrlList = await getInfoUrlList(countyName);
    const items = await Promise.all(infoUrlList.map(async (item) => await getInfoContent(ctx, item)));

    ctx.state.data = {
        title: `政府公开信息 - ${countyName}`,
        link: basicInfoDict[countyName].infoUrl,
        item: items.map((item) => ({
            title: item.title,
            description: art(path.resolve(__dirname, './templates/govPublicInfo.art'), { item }),
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
