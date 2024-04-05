import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const yzb_base_url = 'http://yzb.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    } else if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    return url.hostname === 'yzb.tju.edu.cn' ? 'tju-yzb' : 'unknown';
};

export const route: Route = {
    path: '/yzb/:type?',
    categories: ['university'],
    example: '/tju/yzb/notice',
    parameters: { type: 'default `notice`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Admission Office of Graduate',
    maintainers: ['SuperPung'],
    handler,
    description: `| School-level Notice | Master | Doctor | On-the-job Degree |
  | :-----------------: | :----: | :----: | :---------------: |
  |        notice       | master | doctor |        job        |`,
};

async function handler(ctx) {
    const type = ctx.params && ctx.req.param('type');
    let path, subtitle;

    switch (type) {
        case 'notice':
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
            break;
        case 'master':
            subtitle = '统考硕士';
            path = 'xwzx/tkss_xw/';
            break;
        case 'doctor':
            subtitle = '统考博士';
            path = 'xwzx/tkbs_xw/';
            break;
        case 'job':
            subtitle = '在职学位';
            path = 'xwzx/zzxw/';
            break;
        default:
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
    }
    let response = null;
    try {
        response = await got(yzb_base_url + path, {
            headers: {
                Referer: yzb_base_url,
            },
            responseType: 'buffer',
        });
    } catch {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        return {
            title: '天津大学研究生招生网 - ' + subtitle,
            link: yzb_base_url + path,
            description: '链接失效' + yzb_base_url + path,
            item: [
                {
                    title: '提示信息',
                    link: repo_url,
                    description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`,
                },
            ],
        };
    } else {
        const $ = load(iconv.decode(response.data, 'gbk'));
        const list = $('body > table:nth-child(3) > tbody > tr > td.table_left_right > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr')
            .slice(1, -1)
            .map((_index, item) => {
                const href = $('td > a', item).attr('href');
                const type = pageType(href);
                return {
                    title: $('td > a', item).text(),
                    link: type === 'in-site' ? yzb_base_url + path + href : href,
                    pubDate: timezone(parseDate($('.font_10_time', item).text().slice(2, -2), 'YYYY-MM-DD'), +8),
                    type,
                };
            })
            .get();

        const items = await Promise.all(
            list.map((item) => {
                switch (item.type) {
                    case 'tju-yzb':
                    case 'in-site':
                        return cache.tryGet(item.link, async () => {
                            let detailResponse = null;
                            try {
                                detailResponse = await got(item.link, { responseType: 'buffer' });
                                const content = load(iconv.decode(detailResponse.data, 'gbk'));
                                content('.font_18_b').remove();
                                content('.font_grey_en').remove();
                                item.description = content('.nav_a10 > table > tbody').html();
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

        return {
            title: '天津大学研究生招生网 - ' + subtitle,
            link: yzb_base_url + path,
            item: items,
        };
    }
}
