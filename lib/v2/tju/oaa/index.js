const got = require('@/utils/got');
const cheerio = require('cheerio');
const { finishArticleItem } = require('@/utils/wechat-mp');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const oaa_base_url = 'http://oaa.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    } else if (url.hostname === 'oaa.tju.edu.cn') {
        return 'tju-oaa';
    } else {
        return 'unknown';
    }
};

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let path, subtitle;

    switch (type) {
        case 'news':
            subtitle = '新闻动态';
            path = 'xwdt.htm';
            break;
        case 'notification':
            subtitle = '通知公告';
            path = 'tzgg.htm';
            break;
        default:
            subtitle = '新闻动态';
            path = 'xwdt.htm';
    }
    let response = null;
    try {
        response = await got(oaa_base_url + path, {
            headers: {
                Referer: oaa_base_url,
            },
        });
    } catch (e) {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        ctx.state.data = {
            title: '天津大学教务处 - ' + subtitle,
            link: oaa_base_url + path,
            description: '链接失效' + oaa_base_url + path,
            item: [
                {
                    title: '提示信息',
                    link: repo_url,
                    description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`,
                },
            ],
        };
    } else {
        const $ = cheerio.load(response.data);
        const list = $('.notice_l > ul > li > dl > dt')
            .map((_index, item) => {
                const href = $('a', item).attr('href');
                const type = pageType(href);
                return {
                    title: $('h2', item).text(),
                    link: type === 'in-site' ? oaa_base_url + href : href,
                    pubDate: timezone(parseDate($('.fl_01_r_time', item).text(), 'DDYYYY-MM'), +8),
                    type,
                };
            })
            .get();

        const items = await Promise.all(
            list.map((item) => {
                switch (item.type) {
                    case 'wechat-mp':
                        return finishArticleItem(ctx, item);
                    case 'tju-oaa':
                    case 'in-site':
                        return ctx.cache.tryGet(item.link, async () => {
                            let detailResponse = null;
                            try {
                                detailResponse = await got(item.link, { https: { rejectUnauthorized: false } });
                                const content = cheerio.load(detailResponse.data);
                                item.description = content('.v_news_content').html();
                            } catch (e) {
                                // ignore error handler
                            }
                            return item;
                        });
                    default:
                        return item;
                }
            })
        );

        ctx.state.data = {
            title: '天津大学教务处 - ' + subtitle,
            link: oaa_base_url + path,
            description: null,
            item: items,
        };
    }
};
