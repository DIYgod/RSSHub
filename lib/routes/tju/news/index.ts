// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const news_base_url = 'http://news.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    } else if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    return url.hostname === 'news.tju.edu.cn' ? 'tju-news' : 'unknown';
};

export default async (ctx) => {
    const type = ctx.params && ctx.req.param('type');
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
    } catch {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        ctx.set('data', {
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
        });
    } else {
        const $ = load(response.data);

        let list;
        list = type === 'picture' ? $('.picList > li').get() : $('.indexList > li').get();

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
                        return cache.tryGet(item.link, async () => {
                            let detailResponse = null;
                            try {
                                delete item.type;
                                detailResponse = await got(item.link);
                                const content = load(detailResponse.data);
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
                            } catch {
                                // ignore error handler
                            }
                            return item;
                        });
                    default:
                        return item;
                }
            })
        );

        ctx.set('data', {
            title: '天津大学新闻网 - ' + subtitle,
            link: news_base_url + path,
            item: items,
        });
    }
};
