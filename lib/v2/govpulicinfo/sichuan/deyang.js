const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');

const rootUrl = 'http://xxgk.deyang.gov.cn/xxgkml2020';

// 地区名称对照表
const nameDict = {
    'deyang': 'dys',
    'mianzhu': 'mzs'
}


const getInstitutionId = async (ctx, county) => {
    const url = `${rootUrl}/ptlj.jsp?regionName=${county}`;

    return await ctx.cache.tryGet(`${county}InstitutionId`, async () => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        const dataList = $('#details_content > div > div > div > div:nth-child(4) > ul > li > a');
        const _tmp = {};
        for (let i = 0; i < length; i++) {
            const _$ = cheerio.load(dataList[0]);
            _tmp[_$.html()] = _$.attr('href').split('deptId=')[1];
        }
        return _tmp;
    });
}

const getInfoUrlList = async (ctx, county, institutionId) => {
    const url = `${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}&pageSize=15`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    // todo: const pageNum = parseInt($('#list_content > div > span:nth-child(3)').html().match(/\d*/g)[1]);
    const pageNum = 1;
    const pageUrlList = [];

    // TODO: 此处建议限制最大pageNum,待定
    for (let i=1;i<=pageNum;i++){
        pageUrlList.push(`${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}&pageSize=15$pageIndex=${i}`)
    }
    const infoUrlList = await Promise.all(pageUrlList.map(async (url) => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        const InfoList = $('#list_content > ul > li > a')
        return InfoList.map((item) => {
            return `${rootUrl}/${$(InfoList[item]).attr('href')}`

        })
    }));
    return infoUrlList;

}

const getInfoContent = async (ctx, url) => {
    const infoId = url.split('id=')[1].split('&type')[0];
    const content = await ctx.cache.tryGet(`govPublicInfo${infoId}`, async () => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        return {
            title: $('#headline').text(),
            id: infoId,
            infoNum: $('#symbol > div:nth-child(1) > div:nth-child(2) > span').text().split('\n')[1].replace(/(^\s*)|(\s*$)/g, ""),
            data: parseDate($('#symbol > div:nth-child(1) > div:nth-child(3)').text().split('\n')[1].replace(/(^\s*)|(\s*$)/g, "")),
            keyWord: $('#symbol > div:nth-child(2) > div:nth-child(1)')[1].replace(/(^\s*)|(\s*$)/g, ""),
            source: $('#symbol > div:nth-child(2) > div:nth-child(3)')[1].replace(/(^\s*)|(\s*$)/g, ""),
            content: $('#details_content > div.content').text(),
            file: '',
            link: url

        }
    })
    return content;

}


module.exports = async (ctx) => {
    const countyName = ctx.params.countyName;
    const county = nameDict[countyName];
    let institutionName = ctx.params.institutionName || '';
    let institutionId = 0;
    if (institutionName) {
        const institutionDict = await getInstitutionId(ctx, county);
        institutionId = institutionDict[institutionName];
    }

    const infoUrlList = await getInfoUrlList(ctx, county, institutionId);
    const items = await infoUrlList.map(async (item) => {
        const content = await getInfoContent(ctx, infoUrlList[item]);
        return content;
    })

    ctx.state.data = {
        title: `政府信息公开 - ${county} ${institutionName}`,
        link: `${rootUrl}/gklist_iframe.jsp?deptId=${institutionId}&regionName=${county}`,
        item: items.map((item) => ({
            title: item.title,
            description: item.content,
            link: item.link,
            guid: item.id
        }))

    };
};
