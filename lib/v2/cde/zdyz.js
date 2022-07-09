const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');

const baseUrl = 'https://www.cde.org.cn';
const zdyzMap = {
    zdyz: {
        domesticGuide: {
            title: '发布通告',
            url: `${baseUrl}/zdyz/listpage/2853510d929253719601db17b8a9fd81`,
            endPoint: '/zdyz/getDomesticGuideList',
            form: {
                pageNum: 1,
                pageSize: 10,
                searchTitle: '',
                isFbtg: 1,
                classid: '2853510d929253719601db17b8a9fd81',
                issueDate1: '',
                issueDate2: '',
            },
        },
        opinionList: {
            title: '征求意见',
            url: `${baseUrl}/zdyz/listpage/3c49fad55caad7a034c263cfc2b6eb9c`,
            endPoint: '/zdyz/getOpinionList',
            form: {
                pageNum: 1,
                pageSize: 10,
                searchTitle: '',
                issueDate1: '',
                issueDate2: '',
                fclass: '征求意见',
            },
        },
    },
};

module.exports = async (ctx) => {
    const { category } = ctx.params;

    const { data } = await got.post(`${baseUrl}${zdyzMap.zdyz[category].endPoint}`, {
        form: zdyzMap.zdyz[category].form,
        headers: {
            referer: zdyzMap.zdyz[category].url,
            cookie: await utils.getCookie(ctx),
        },
    });

    const list = data.data.records.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.issueDate),
        link: item.externalLinks,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        referer: zdyzMap.zdyz[category].url,
                        cookie: await utils.getCookie(ctx),
                    },
                });
                const $ = cheerio.load(response.data);
                item.description = $('.new_detail_content').html() + $('.relatedNews').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${zdyzMap.zdyz[category].title} - 国家药品监督管理局药品审评中心`,
        link: zdyzMap.zdyz[category].url,
        item: items,
    };
};
