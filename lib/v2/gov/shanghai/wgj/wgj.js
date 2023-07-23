const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'http://wsbs.wgj.sh.gov.cn';
    const currentUrl = `${baseUrl}/shwgj_ywtb/core/web/welcome/index!toResultNotice.action`;
    const page = ctx.params.page ?? 1;
    const searchParams = {
        flag: 1,
        'pageDoc.pageNo': page,
    };
    const response = await got({
        method: 'post',
        url: currentUrl,
        searchParams,
    });

    const $ = cheerio.load(response.data);
    const list = $('#div_md > table > tbody > tr > td:nth-child(1) > a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.prop('innerText').replace(/\s/g, ''),
                link: item.attr('href'),
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: baseUrl + item.link,
                });
                const $ = cheerio.load(detailResponse.data);
                const dateElement = $('div[align="right"][style*="padding: 10px"]').last();
                const dateText = dateElement.text().trim();
                const hostingUnit = $('td:contains("举办单位：")').next().text().trim();
                const licenseNumber = $('td:contains("许可证号：")').next().text().trim();
                const performanceName = $('td:contains("演出名称:")').next().text().trim();
                const performanceDate = $('td:contains("演出日期：")').next().text().trim();
                const performanceVenue = $('td:contains("演出场所：")').next().text().trim();
                const mainActors = $('td:contains("主要演员：")').next().text().trim();
                const actorCount = $('td:contains("演员人数：")').next().text().trim();
                const showCount = $('td:contains("场次：")').next().text().trim();

                item.description = art(path.join(__dirname, './templates/wgj.art'), {
                    hostingUnit,
                    licenseNumber,
                    performanceName,
                    performanceDate,
                    performanceVenue,
                    mainActors,
                    actorCount,
                    showCount,
                });
                item.pubDate = parseDate(dateText);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
