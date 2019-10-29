const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let url = '';
    let title = '';
    switch (uid) {
        case 'bm':
            url = `http://www.gov.cn/xinwen/lianbo/bumen.htm`;
            title = '中国政府网 - 部门政务';
            break;
        case 'yw':
            url = `http://www.gov.cn/xinwen/yaowen.htm`;
            title = '中国政府网 - 新闻要闻';
            break;
        case 'gd':
            url = `http://www.gov.cn/xinwen/gundong.htm`;
            title = '中国政府网 - 滚动新闻';
            break;
        case 'gwy':
            url = 'http://www.gov.cn/pushinfo/v150203/';
            title = '中国政府网 - 国务院信息';
            break;
        default:
            logger.error('pattern not matched');
    }
    const listData = await got.get(url);
    const $ = cheerio.load(listData.data);
    const list = $('.news_box .list li:not(.line)');

    ctx.state.data = {
        title: title,
        link: url,
        item: await Promise.all(
            list &&
                list
                    .slice(1, 12)
                    .map(async (index, item) => {
                        item = $(item);
                        let fullText = '';
                        const href = item.find('a').attr('href');
                        const contenlUrl = href.startsWith('/') ? `http://www.gov.cn${href}` : href;
                        const description = await ctx.cache.tryGet(contenlUrl, async () => {
                            const fullTextGet = await got.get(contenlUrl);
                            const fullTextData = cheerio.load(fullTextGet.data);
                            const $1 = fullTextData.html();
                            if ($1.search(/UCAP-CONTENT/g) === -1) {
                                fullText = fullTextData('body').html();
                            } else {
                                fullText = fullTextData('#UCAP-CONTENT').html();
                            }
                            const regImg = /(img src=")(.*)(".*)/g;
                            const regUrl = /(http.*\/)(content.*)/;
                            const urlSplit = contenlUrl.replace(regUrl, '$1');
                            return fullText.replace(regImg, '$1' + urlSplit + '$2' + '$3');
                        });
                        return {
                            title: item.find('a').text(),
                            description: description,
                            link: contenlUrl,
                        };
                    })
                    .get()
        ),
    };
};
