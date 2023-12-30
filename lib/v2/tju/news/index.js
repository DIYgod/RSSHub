const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const news_base_url = 'http://news.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    } else if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    if (url.hostname === 'news.tju.edu.cn') {
        return 'tju-news';
    } else {
        return 'unknown';
    }
};

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let path, subtitle;

    switch (type) {
        case 'focus':
            subtitle = '聚焦天大';
            path = 'jjtd.htm';
            break;
        case 'general':
            subtitle = '综合新闻';
            path = 'zhxw.htm';
            break;
        case 'internal':
            subtitle = '校内新闻';
            path = 'xnxw1/qb.htm';
            break;
        case 'media':
            subtitle = '媒体报道';
            path = 'mtbd.htm';
            break;
        case 'picture':
            subtitle = '图说天大';
            path = 'tstd.htm';
            break;
        default:
            subtitle = '聚焦天大';
            path = 'jjtd.htm';
    }
    let response = null;
    try {
        response = await got(news_base_url + path, {
            headers: {
                Referer: news_base_url,
            },
        });
    } catch (e) {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        ctx.state.data = {
            title: '天津大学新闻网 - ' + subtitle,
            link: news_base_url + path,
            description: '链接失效' + news_base_url + path,
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

        let list;
        if (type === 'picture') {
            list = $('.picList > li').get();
        } else {
            list = $('.indexList > li').get();
        }

        list = list.map((item) => {
            const href = $('h4 > a', item).attr('href');
            const type = pageType(href);
            return {
                title: $('h4 > a', item).text(),
                link: type === 'in-site' ? news_base_url + href : href,
                type,
            };
        });

        const items = await Promise.all(
            list.map((item) => {
                switch (item.type) {
                    case 'tju-news':
                    case 'in-site':
                        return ctx.cache.tryGet(item.link, async () => {
                            let detailResponse = null;
                            try {
                                delete item.type;
                                detailResponse = await got(item.link);
                                const content = cheerio.load(detailResponse.data);
                                item.pubDate = timezone(
                                    parseDate(
                                        content('.contentTime')
                                            .text()
                                            .match(/\d{4}-\d{2}-\d{2}/)[0],
                                        'YYYY-MM-DD'
                                    ),
                                    +8
                                );
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
            title: '天津大学新闻网 - ' + subtitle,
            link: news_base_url + path,
            item: items,
        };
    }
};
