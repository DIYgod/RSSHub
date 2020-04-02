const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const liburl = require('url');

const root_url = 'http://www.suzhou.gov.cn/';

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let url = '';
    let title = '';
    switch (uid) {
        case 'qxkx':
        case 'district':
            url = 'http://www.suzhou.gov.cn/szsrmzf/qxkx/nav_list.shtml';
            title = '苏州市政府 - 区县快讯';
            break;
        case 'szyw':
        case 'news':
            url = 'http://www.suzhou.gov.cn/szsrmzf/szyw/nav_list.shtml';
            title = '苏州市政府 - 政务要闻';
            break;
        case 'bmdt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/bmdt/nav_list.shtml';
            title = '苏州市政府 - 部门动态';
            break;
        case 'xwsp':
            url = 'http://www.suzhou.gov.cn/szsrmzf/xwsp/nav_list.shtml';
            title = '苏州市政府 - 新闻视频';
            break;
        case 'rdzt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/rdzt/nav_list.shtml';
            title = '苏州市政府 - 热点专题';
            break;
        case 'sbjzt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/sbjzt/nav_list.shtml';
            title = '苏州市政府 - 市本级专题';
            break;
        case 'zxrdzt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/zxrdzt/nav_list.shtml';
            title = '苏州市政府 - 最新热点专题';
            break;
        case 'wqzt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/wqzt/nav_list.shtml';
            title = '苏州市政府 - 往期专题';
            break;
        case 'qxzt':
            url = 'http://www.suzhou.gov.cn/szsrmzf/qxzt/nav_list.shtml';
            title = '苏州市政府 - 区县专题';
            break;
        case 'zwgg':
            url = 'http://www.suzhou.gov.cn/szsrmzf/zwgg/nav_list.shtml';
            title = '苏州市政府 - 政务公告';
            break;
        case 'bmzx':
            url = 'http://www.suzhou.gov.cn/szsrmzf/bmzx/nav_list.shtml';
            title = '苏州市政府 - 便民资讯';
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

    const $ = cheerio.load(response.data);
    const list = $('div.cont > ul > li');

    ctx.state.data = {
        title: title,
        link: url,
        item: await Promise.all(
            list
                .slice(1, 10)
                .map(async (_, item) => {
                    item = $(item);

                    // 获取全文
                    const a = item.find('a');
                    const link = liburl.resolve(root_url, a.attr('href'));
                    const description = await ctx.cache.tryGet(link, async () => {
                        const fullText = await got({
                            method: 'get',
                            url: link,
                            Host: 'www.suzhou.gov.cn',
                            responseType: 'buffer',
                        });
                        const fullTextData = cheerio.load(fullText.data);
                        return fullTextData('div.main div.contentShow').html();
                    });
                    return {
                        title: a.text(),
                        description: description,
                        link: link,
                        pubDate: new Date(
                            item
                                .find('span')
                                .text()
                                .trim() + ' GMT+8'
                        ).toUTCString(),
                    };
                })
                .get()
        ),
    };
};
