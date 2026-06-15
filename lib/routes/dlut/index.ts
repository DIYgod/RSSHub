import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

import defaults from './defaults';
import shortcuts from './shortcuts';

type DlutItem = DataItem & {
    link: string;
};

export const route: Route = {
    path: ['/:site/:category{.+}', '/:site?'],
    name: '站点栏目',
    maintainers: [],
    handler,
    example: '/dlut/ss/bkstz',
    parameters: {
        site: '站点，如 `news`、`teach`、`ss`，默认为 `news`',
        category: '栏目路径或快捷名称，如 `bkstz`，默认为对应站点的默认栏目',
    },
    description: '大连理工大学各站点栏目，支持直接填写栏目路径或使用内置快捷名称。',
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx) {
    const { site = 'news' } = ctx.req.param();
    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }

    let items;
    let { category = Object.hasOwn(defaults, site) ? defaults[site] : '' } = ctx.req.param();
    category = Object.hasOwn(shortcuts, site) && Object.hasOwn(shortcuts[site], category) ? shortcuts[site][category] : category;

    const rootUrl = `https://${site}.dlut.edu.cn`;
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    switch (site) {
        case 'panjin': {
            items = $('a.news').slice(0, -4);

            break;
        }
        case 'fldpj': {
            items = $('li[id^="line_u9"]').find('a');

            break;
        }
        case 'ss': {
            items = $('.list04 .item a');

            break;
        }
        default: {
            $('.Next, .rjxw_left, .pb_sys_common').remove();
            items = $('.txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili').find('a');
        }
    }

    items = items
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .flatMap((item) => {
            item = $(item);

            const href = item.attr('href');
            if (!href) {
                return [];
            }

            const result: DlutItem = {
                title: '',
                link: href.startsWith('http') ? href : `${rootUrl}/${href.replace(/^[./]+/, '')}`,
            };

            if (site === 'fldpj') {
                result.title = item.find('em').text();
                result.pubDate = parseDate(item.find('span').text());
            } else {
                const dateRegex = /(\d{4}[/年-]\d{2}[/月-]\d{2})/;

                let dateMatch = item.parent().text().match(dateRegex);
                if (!dateMatch) {
                    dateMatch = item.parent().parent().text().match(dateRegex);
                }

                result.title = item.attr('title') ?? (item.find('h2').text() || item.text());
                if (dateMatch) {
                    result.pubDate = parseDate(dateMatch[1].replaceAll(/年|月/g, '-'));
                }
            }

            return [result];
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('.v_news_content, .conbox').html();
                } catch {
                    // Fo example: http://dutdice.dlut.edu.cn/nry.jsp?urltype=news.NewsContentUrl&wbtreeid=1006&wbnewsid=9820
                    // do nothing to the cases which require fetching resources from the Intranet :P
                }
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
