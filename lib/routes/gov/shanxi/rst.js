const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    let title = '';
    switch (category) {
        case 'rsks-tzgg':
            url = `http://rst.shanxi.gov.cn/rsks/tzgg/`;
            title = '山西人事考试专栏 - 通知公告';
            break;
        case 'rsks-gwyks':
            url = 'http://rst.shanxi.gov.cn/rsks/gwyks/';
            title = '山西人事考试专栏 - 公务员考试';
            break;
        case 'rsks-sydwks':
            url = `http://rst.shanxi.gov.cn/rsks/sydwks/`;
            title = '山西人事考试专栏 - 事业单位考试';
            break;
        case 'rsks-zyjsryzgks':
            url = `http://rst.shanxi.gov.cn/rsks/zyjsryzgks/`;
            title = '山西人事考试专栏 - 专业技术人员资格考试';
            break;
        case 'rsks-qtks':
            url = `http://rst.shanxi.gov.cn/rsks/qtks/`;
            title = '山西人事考试专栏 - 其他考试';
            break;
        default:
            logger.error('pattern not matched');
    }
    const response = await got({
        method: 'get',
        url: url,
        Host: 'rst.shanxi.gov.cn',
        responseType: 'buffer',
    });

    const $ = cheerio.load(response.data);
    const list = $('.exam-main ul.list-items-box-inner li');

    ctx.state.data = {
        title: title,
        link: url,
        item: await Promise.all(
            list &&
                list
                    .map(async (index, item) => {
                        item = $(item);

                        // // 获取全文
                        const contenlUrl = item.find('a').attr('href');
                        const link = resolve_url(url, contenlUrl);
                        const description = await ctx.cache.tryGet(link, async () => {
                            const fullText = await got({
                                method: 'get',
                                url: link,
                                Host: 'rst.shanxi.gov.cn',
                                responseType: 'buffer',
                            });
                            const fullTextData = cheerio.load(fullText.data);
                            return fullTextData('.common-detail-inner').html();
                        });
                        return {
                            title: item.find('a').text(),
                            description: description,
                            link: link,
                        };
                    })
                    .get()
        ),
    };
};
