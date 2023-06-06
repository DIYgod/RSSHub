const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const originDomain = 'https://www.gov.cn';
    let url = '';
    let title = '';
    let list = '';
    switch (uid) {
        case 'bm':
            url = `${originDomain}/lianbo/bumen/index.htm`;
            title = '中国政府网 - 部门政务';
            break;
        case 'yw':
            url = `${originDomain}/yaowen/index.htm`;
            title = '中国政府网 - 新闻要闻';
            break;
        case 'gd':
            // 因 /xinwen/gundong.htm 被重定向到 /yaowen/index.htm, 所以这里直接用要闻的代替了
            url = `${originDomain}/yaowen/index.htm`;
            title = '中国政府网 - 滚动新闻';
            break;
        case 'gwy':
            url = `${originDomain}/pushinfo/v150203/`;
            title = '中国政府网 - 国务院信息';
            break;
        case 'zhengce':
            url = 'http://sousuo.gov.cn/s.htm?t=zhengcelibrary';
            title = '中国政府网 - 政策文件';
            break;
        default:
            logger.error('pattern not matched');
    }
    const listData = await got.get(url);
    const $ = cheerio.load(listData.data);
    if (url.includes('zhengcelibrary')) {
        list = $('.dys_middle_result_content_item');
    } else if (url.includes('bumen')) {
        list = $('.infolist li');
    } else {
        list = $('.news_box .list li:not(.line)');
    }

    ctx.state.data = {
        title,
        link: url,
        item: await Promise.all(
            list.toArray().map(async (item) => {
                item = $(item);
                let fullText = '';
                let href = '';
                let contentUrl = '';
                let description = '';
                let fullTextData = '';
                let fullTextGet = '';
                if (item.html().search(/dysMiddleResultConItemTitle/g) !== -1) {
                    contentUrl = item.find('a').attr('href');
                    if (!contentUrl.includes('content')) {
                        description = item.find('a').text(); // 忽略获取吹风会的全文
                    } else {
                        description = await ctx.cache.tryGet(contentUrl, async () => {
                            fullTextGet = await got.get(contentUrl);
                            fullTextData = cheerio.load(fullTextGet.data);
                            if (fullTextData.html().search(/pages_content/g) !== -1) {
                                fullTextData('.shuzi').remove(); // 移除videobg的图片
                                fullTextData('#myFlash').remove(); // 移除flash
                                return fullTextData('.pages_content').html();
                            } else {
                                fullTextData('.shuzi').remove(); // 移除videobg的图片
                                fullTextData('#myFlash').remove(); // 移除flash
                                return fullTextData('#UCAP-CONTENT').html();
                            }
                        });
                    }
                } else {
                    href = item.find('a').attr('href');
                    if (href.startsWith('.')) {
                        href = new URL(href, url).pathname;
                    }
                    contentUrl = href.startsWith('/') ? `${originDomain}${href}` : href;
                    if (!contentUrl.includes('content')) {
                        description = item.find('a').text(); // 忽略获取吹风会的全文
                    } else {
                        description = await ctx.cache.tryGet(contentUrl, async () => {
                            fullTextGet = await got.get(contentUrl);
                            fullTextData = cheerio.load(fullTextGet.data);
                            const $1 = fullTextData.html();
                            if (contentUrl.search(/zhengceku/g) !== -1) {
                                // 政策文件库
                                fullText = fullTextData('.pages_content').html();
                            } else {
                                if ($1.search(/UCAP-CONTENT/g) === -1) {
                                    fullTextData('.shuzi').remove(); // 移除videobg的图片
                                    fullTextData('#myFlash').remove(); // 移除flash
                                    fullText = fullTextData('body').html();
                                } else {
                                    fullTextData('.shuzi').remove(); // 移除videobg的图片
                                    fullTextData('#myFlash').remove(); // 移除flash
                                    fullText = fullTextData('#UCAP-CONTENT').html();
                                }
                            }
                            const regImg = /(img src=")(.*)(".*)/g;
                            const regUrl = /(http.*\/)(content.*)/;
                            const urlSplit = contentUrl.replace(regUrl, '$1');
                            return fullText.replace(regImg, '$1' + urlSplit + '$2' + '$3'); // 处理图片链接
                        });
                    }
                }
                return {
                    title: item.find('a').text(),
                    description,
                    link: contentUrl,
                };
            })
        ),
    };
};
