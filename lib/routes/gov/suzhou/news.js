const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const liburl = require('url');
const util = require('./utils');
const root_url = 'https://www.suzhou.gov.cn/';

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let url = '';
    let title = '';
    let urljs = '';
    switch (uid) {
        case 'szyw':
        case 'news':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=5057aeffb1a84a7e8aeded87728da48c';
            url = 'https://www.suzhou.gov.cn/szsrmzf/szyw/nav_list.shtml';
            title = '苏州市政府 - 苏州要闻';
            break;
        case 'qxkx':
        case 'district':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=75c636ea0efb487ea7e479e3cc0ff3e5';
            url = 'https://www.suzhou.gov.cn/szsrmzf/qxkx/nav_list.shtml';
            title = '苏州市政府 - 区县快讯';
            break;
        case 'bmdt':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=b3d097e3eb79421f88439ea381ce33c3';
            url = 'https://www.suzhou.gov.cn/szsrmzf/bmdt/nav_list.shtml';
            title = '苏州市政府 - 部门动态';
            break;
        case 'xwsp':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=507980d214c943ebb0a70853ec94b12e';
            url = 'https://www.suzhou.gov.cn/szsrmzf/xwsp/nav_list.shtml';
            title = '苏州市政府 - 新闻视频';
            break;
        case 'rdzt':
            url = 'https://www.suzhou.gov.cn/szsrmzf/rdzt/nav_list.shtml';
            title = '苏州市政府 - 热点专题';
            break;
        case 'sbjzt':
            url = 'https://www.suzhou.gov.cn/szsrmzf/sbjzt/nav_list.shtml';
            title = '苏州市政府 - 市本级专题';
            break;
        case 'zxrdzt':
            url = 'https://www.suzhou.gov.cn/szsrmzf/zxrdzt/nav_list.shtml';
            title = '苏州市政府 - 最新热点专题';
            break;
        case 'wqzt':
            url = 'https://www.suzhou.gov.cn/szsrmzf/wqzt/nav_list.shtml';
            title = '苏州市政府 - 往期专题';
            break;
        case 'qxzt':
            url = 'https://www.suzhou.gov.cn/szsrmzf/qxzt/nav_list.shtml';
            title = '苏州市政府 - 区县专题';
            break;
        case 'zwgg':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=260915178a1f4c4fac44c4bf6378c9b0';
            url = 'https://www.suzhou.gov.cn/szsrmzf/zwgg/nav_list.shtml';
            title = '苏州市政府 - 政务公告';
            break;
        case 'mszx':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=dc60acecb0be46b89d42272dcb8bd32b';
            url = 'https://www.suzhou.gov.cn/szsrmzf/mszx/nav_list.shtml';
            title = '苏州市政府 - 便民公告';
            break;
        case 'bmzx':
            urljs = 'https://www.suzhou.gov.cn/szinf/info/getInfoCommon/?pagesize=15&currpage=1&channelid=b015bfa5e5514cc9a26cd9f956ef8e69';
            url = 'https://www.suzhou.gov.cn/szsrmzf/bmzx/bmzx_list.shtml';
            title = '苏州市政府 - 民生资讯';
            break;
        default:
            logger.error('pattern not matched');
    }
    if (urljs) {
        const responsejs = await got({
            method: 'get',
            url: urljs,
            Host: 'www.suzhou.gov.cn',
        });
        const jsdata = responsejs.data.infolist;

        ctx.state.data = {
            title,
            link: url,
            item: await Promise.all(
                jsdata.slice(0, 10).map(async (item) => {
                    // 获取全文
                    const link = item.link.indexOf('http') === -1 ? liburl.resolve(root_url, item.link) : item.link;
                    const description = await ctx.cache.tryGet(link, async () => {
                        let responsehtml;

                        try {
                            responsehtml = await got({
                                method: 'get',
                                url: link,
                            });
                            const content = util.content(responsehtml.data);
                            return content;
                        } catch (error) {
                            return '';
                        }
                    });
                    return {
                        title: item.title,
                        description,
                        link,
                        pubDate: item.pubtime,
                    };
                })
            ),
        };
    }
    if (!urljs) {
        const response = await got({
            method: 'get',
            url,
        });

        const $ = cheerio.load(response.data);
        const list = $('div.pageList li');

        ctx.state.data = {
            title,
            link: url,
            item: await Promise.all(
                list
                    .slice(0, 10)
                    .map((_, item) => {
                        item = $(item);
                        const a = item.find('a');
                        const link = liburl.resolve(root_url, a.attr('href'));
                        return {
                            title: a.attr('title'),
                            link,
                            pubDate: new Date(item.find('.time').text()).toUTCString(),
                        };
                    })
                    .get()
            ),
        };
    }
};
