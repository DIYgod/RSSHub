const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'http://xxgk.deyang.gov.cn/xxgkml2020';

// 地区名称对照表
const nameDict = {
    德阳市: 'dys',
    绵竹市: 'mzs',
    什邡市: 'sfs',
    旌阳区: 'jyq',
    罗江区: 'ljx',
    广汉市: 'ghs',
    中江县: 'zjx',
    高新区: 'gxq',
};

const getInstitutionId = async (ctx, county) => {
    const url = `${rootUrl}/ptlj.jsp?regionName=${county}`;

    return await ctx.cache.tryGet(`${county}InstitutionId`, async () => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        const dataList = $('#details_content > div > div > div > div:nth-child(4) > ul > li > a');
        const _tmp = {};
        for (let i = 0; i < dataList.length; i++) {
            _tmp[$(dataList[i]).html()] = parseInt($(dataList[i]).attr('href').split('deptId=')[1]);
        }
        return _tmp;
    });
};

const getInfoUrlList = async (county, institutionId) => {
    const url = `${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}&pageSize=15`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const pageNum = parseInt($('#list_content > div > span:nth-child(3)').html().match(/\d*/g)[1]);
    const pageUrlList = [];

    // 此处建议限制最大pageNum,最大5页,单页15条
    for (let i = 1; i <= Math.min(pageNum, 5); i++) {
        pageUrlList.push(`${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}&pageSize=15$pageIndex=${i}`);
    }
    const _tmpList = await Promise.all(
        pageUrlList.map(async (url) => {
            const response = await got.get(url);
            const $ = cheerio.load(response.data);
            const InfoList = $('#list_content > ul > li > a');
            return InfoList.map((item) => `${rootUrl}/${$(InfoList[item]).attr('href')}`);
        })
    );
    let infoUrlList = [];
    for (let i = 0; i < _tmpList.length; i++) {
        infoUrlList = infoUrlList.concat(_tmpList[i].toArray());
    }
    return infoUrlList;
};

const getInfoContent = async (ctx, url) => {
    const infoId = url.split('id=')[1].split('&type')[0];
    return await ctx.cache.tryGet(`govPublicInfo${infoId}`, async () => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        const fileNodes = $('#symbol > div:nth-child(3) > div > a');
        const fileList = [];
        for (let i = 0; i < fileNodes.length; i++) {
            fileList.push({
                name: $(fileNodes[i]).text(),
                url: `${rootUrl}/${$(fileNodes[i]).attr('href')}`,
            });
        }
        const rawDate = $('#symbol > div:nth-child(1) > div:nth-child(3)').text().split('\n')[1].trim();
        return {
            title: $('#headline').text(),
            id: infoId,
            infoNum: $('#symbol > div:nth-child(1) > div:nth-child(2) > span').text().split('\n')[1].trim(),
            pubDate: parseDate(rawDate),
            date: rawDate,
            keyWord: $('#symbol > div:nth-child(2) > div:nth-child(1)').text().slice(8),
            source: $('#symbol > div:nth-child(2) > div:nth-child(3)').text().slice(5),
            content: $('#details_content > div.content').html(),
            file: fileList,
            link: url,
        };
    });
};

module.exports = async (ctx) => {
    const countyName = ctx.params.countyName;
    const county = nameDict[countyName];
    const institutionName = ctx.params.institutionName || '';
    let institutionId = 0;
    if (institutionName) {
        const institutionDict = await getInstitutionId(ctx, county);
        institutionId = institutionDict[institutionName];
    }

    const infoUrlList = await getInfoUrlList(county, institutionId);
    const items = await Promise.all(infoUrlList.map(async (item) => await getInfoContent(ctx, item)));

    ctx.state.data = {
        title: `政府公开信息 - ${countyName} ${institutionName}`,
        link: `${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}`,
        item: items.map((item) => ({
            title: item.title,
            description: art(path.resolve(__dirname, './templates/govPublicInfo.art'), { item }),
            link: item.link,
            guid: item.id,
            pubDate: item.pubDate,
        })),
    };
};
