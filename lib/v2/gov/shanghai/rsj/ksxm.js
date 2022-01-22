const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'http://www.rsj.sh.gov.cn';

module.exports = async (ctx) => {
    const url = `${rootUrl}/ksyzc/wangz/kwaplist_300.jsp`;

    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });
    const dataHtml = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(dataHtml);

    const items = $('kwap')
        .map((_, item) => ({
            title: $(item).find('kaosxmmc').text(),
            link: `http://www.rsj.sh.gov.cn/ksyzc/index801.jsp`,
            description: art(path.join(__dirname, './templates/ksxm.art'), {
                name: $(item).find('kaosxmmc').text(),
                type: $(item).find('kaoslb_dmfy').text(),
                date: $(item).find('kaosrq').text(),
                registrationDeadline: $(item).find('baomksrq_A300').text(),
            }),
            guid: `${$(item).find('kaosrq').text()}${$(item).find('kaosxmmc').text()}`,
        }))
        .get();

    ctx.state.data = {
        title: '上海市职业能力考试院 - 考试项目',
        link: url,
        item: items,
    };
};
