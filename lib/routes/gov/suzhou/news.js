const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let url = '';
    let title = '';
    switch (uid) {
        case 'district':
            url = `http://www.suzhou.gov.cn/news/sxqdt/index.shtml`;
            title = '苏州市政府 - 区县快讯';
            break;
        case 'news':
            url = 'http://www.suzhou.gov.cn/news/bmdt_991/index.shtml';
            title = '苏州市政府 - 政务要闻';
            break;
        default:
            logger.error('pattern not matched');
    }
    const response = await got({
        method: 'get',
        url: url,
        Host: 'www.suzhou.gov.cn',
        responseType: 'buffer',
    });

    // 使用iconv-lite解决node当中不支持GBK编码的问题
    const data = iconv.decode(response.data, 'GBK');

    const $ = cheerio.load(data);
    const list = $('.xwzx-right li');

    ctx.state.data = {
        title: title,
        link: url,
        item: await Promise.all(
            list &&
                list
                    .slice(1, 10)
                    .map(async (index, item) => {
                        item = $(item);

                        // // 获取全文
                        const regContentUrl = /(\.)(\/.*shtml)/;
                        const regUrl = /(http.*)(\/index.shtml)/;
                        const contenlUrl = item.find('a').attr('href');
                        const link = url.replace(regUrl, '$1') + contenlUrl.replace(regContentUrl, '$2');
                        const description = await ctx.cache.tryGet(link, async () => {
                            const fullText = await got({
                                method: 'get',
                                url: link,
                                Host: 'www.suzhou.gov.cn',
                                responseType: 'buffer',
                            });
                            const dataGBK = iconv.decode(fullText.data, 'GBK');
                            const fullTextData = cheerio.load(dataGBK);
                            return fullTextData('.TRS_Editor').html();
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
