const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    let { program = '分析师园地' } = ctx.params;
    const baseUrl = 'https://www.cfachina.org';
    let pageData,
        pageUrl = `${baseUrl}/servicesupport/analygarden/`;

    if (program !== '分析师园地') {
        pageUrl = `${pageUrl}${program}/`;

        const response = await got(pageUrl);
        const $ = cheerio.load(response.data);
        program = $('script:contains("Paging")')
            .text()
            .match(/var name = '(.+)';/)[1];
        pageData = {
            category: $('.crumb a')
                .toArray()
                .map((item) => $(item).text())
                .slice(-2),
        };
    }

    const { data: response } = await got(`${baseUrl}/qx-search/api/wcmSearch/getDataByProgram`, {
        headers: {
            accept: 'application/json, text/plain, */*',
        },
        searchParams: {
            pageNo: 1,
            pageSize: ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20,
            keyword: '',
            startTime: '',
            endTime: '',
            type: '',
            programName: program,
        },
    });

    const items = response.data.dataList.map((item) => {
        const link = new URL(item.docPubUrl, baseUrl).href;
        return {
            title: item.docTitle,
            author: item.docAuthor,
            link,
            pubDate: timezone(parseDate(item.operTime), +8),
            enclosure_url: link,
            enclosure_type: `application/${link.split('.').pop()}`,
        };
    });

    ctx.state.data = {
        title: `${pageData?.category.toReversed().join(' - ') ?? '分析师园地'} - 中国期货业协会`,
        link: pageUrl,
        item: items,
    };
};
