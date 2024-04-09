const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const timezone = require('@/utils/timezone');

// 各地区url信息
const basicInfoDict = {
    绵竹市: {
        rootUrl: 'https://www.mz.gov.cn',
        infoType: {
            fdzdnr: {
                basicUrl: 'https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=15971&cur_page=1',
                name: '法定主动内容',
            },
            gsgg: {
                basicUrl: 'https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=24186&cur_page=1',
                name: '公示公告',
            },
        },
    },
};

const getInfoUrlList = async (rootUrl, infoBasicUrl) => {
    const response = await got(infoBasicUrl);
    const $ = cheerio.load(response.data);
    // 非当前日期文章计数，部分旧文章可能会置顶，目前为发现置顶数超过10
    const infoList = $('body > div.container > div.ewb-white > div.ewb-job > ul > li')
        .toArray()
        .map((item) => ({
            title: $('a', item).attr('title'),
            url: `${rootUrl}${$('a', item).attr('href')}`,
        }));
    return infoList;
};

// 获取信息正文内容
const getInfoContent = (ctx, rootUrl, item) =>
    ctx.cache.tryGet(item.url, async () => {
        const response = await got(item.url);
        // 部分网页会跳转其他类型网站,则不解析，直接附超链接
        try {
            const $ = cheerio.load(response.data);
            const fileList = $('#symbol > div:nth-child(4) > div > span > a')
                .toArray()
                .map((item) => ({
                    name: $(item).text(),
                    url: `${rootUrl}/${$(item).attr('href')}`,
                }));
            const rawDate = $('#symbol > div:nth-child(1) > div:nth-child(3)').text().split('：')[1].trim();
            return {
                title: $('#main').text().trim(),
                id: $('#symbol > div:nth-child(1) > div:nth-child(1)').text().split('：')[1].trim(),
                infoNum: $('#symbol > div:nth-child(1) > div:nth-child(2) > span').text().split('：')[1].trim(),
                pubDate: parseDate(timezone(rawDate, +8)),
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
            description: art(path.join(__dirname, './templates/govPublicInfo.art'), { item }),
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
