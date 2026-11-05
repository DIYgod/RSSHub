import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

import defaults from './defaults';
import shortcuts from './shortcuts';

export const route: Route = {
    path: ['/:site/:category{.+}', '/:site?'],
    categories: ['university'],
    example: '/dut',
    parameters: {
        site: 'Subdomain of dlut.edu.cn, default to news',
        category: 'Category path without .htm; supports the documented shortcuts and subdirectories',
    },
    name: '通用',
    maintainers: ['beautyyuyanli', 'nczitzk', 'ueiu'],
    handler,
    description: `将大学官网栏目地址 \`https://<site>.dlut.edu.cn/<category>.htm\` 中的子域名和栏目路径分别作为 \`site\`、\`category\` 参数。栏目路径可以包含多级目录。

例如，[新闻网的主页新闻](https://news.dlut.edu.cn/zyxw.htm) 对应 \`/dut/news/zyxw\`；省略参数的 \`/dut\` 也订阅此栏目。[盘锦教学与科研工作部的工作动态](https://pjteach.dlut.edu.cn/index/gzdt.htm) 对应多级路径 \`/dut/pjteach/index/gzdt\`。

官网改版前的快捷路径保持兼容：\`/dut/news/ttgz\` 订阅当前主页新闻，\`/dut/news/rcpy\` 和 \`/dut/news/xwjj01/rcpy\` 均订阅当前[人才培养](https://news.dlut.edu.cn/rcpy.htm)栏目。

大部分大学分站可按此规则订阅；需要校园内网或登录的正文页面可能只能返回公开列表中的信息。`,
};

function getCurrentListDate($: CheerioAPI, item: Cheerio<Element>): Date | undefined {
    const time = item.closest('li').find('time').first();
    const calendarTime = time.text().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(calendarTime)) {
        return timezone(parseDate(calendarTime, 'YYYY-MM-DD'), 8);
    }
    const day = time.find('span').text().trim();
    const month = time
        .contents()
        .filter((_, element) => element.type === 'text')
        .text()
        .trim();
    if (/^\d{1,2}$/.test(day) && /^\d{4}-\d{2}$/.test(month)) {
        return timezone(parseDate(`${month}-${day.padStart(2, '0')}`, 'YYYY-MM-DD'), 8);
    }
    const dateBox = item.find('.date').first();
    const monthDay = dateBox.find('span').text();
    const year = dateBox
        .contents()
        .filter((_, element) => element.type === 'text')
        .text()
        .trim();
    if (/^\d{2}-\d{2}$/.test(monthDay) && /^\d{4}$/.test(year)) {
        return timezone(parseDate(`${year}-${monthDay}`, 'YYYY-MM-DD'), 8);
    }
    const texts = item
        .find('p, span')
        .toArray()
        .map((element) => $(element).text().trim());
    const calendarDate = texts.find((text) => /^\d{4}[./-]\d{2}[./-]\d{2}$/.test(text));
    if (calendarDate) {
        return timezone(parseDate(calendarDate.replaceAll(/[./]/g, '-'), 'YYYY-MM-DD'), 8);
    }
    const dayIndex = texts.findIndex((text, index) => /^\d{1,2}$/.test(text) && /^\d{4}-\d{2}$/.test(texts[index + 1] ?? ''));
    if (dayIndex !== -1) {
        return timezone(parseDate(`${texts[dayIndex + 1]}-${texts[dayIndex].padStart(2, '0')}`, 'YYYY-MM-DD'), 8);
    }
}

async function handler(ctx) {
    const site = ctx.req.param('site') ?? 'news';
    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }

    let items;
    let category = ctx.req.param('category') ?? (Object.hasOwn(defaults, site) ? defaults[site] : '');
    category = Object.hasOwn(shortcuts, site) && Object.hasOwn(shortcuts[site], category) ? shortcuts[site][category] : category;

    const rootUrl = `https://${site}.dlut.edu.cn`;
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (site === 'news' && $('.nylistn .txt a').length) {
        items = $('.nylistn .txt a');
    } else if (site === 'panjin') {
        items = $('a.news').length ? $('a.news').slice(0, -4) : $('.tz li a[href]');
    } else if (site === 'perdep' && $('.news-list-txt .news-item a').length) {
        items = $('.news-list-txt .news-item a');
    } else if (['xsgzb', 'pjteach', 'pjxqzwb'].includes(site) && $('a[id^="line_u"]').length) {
        items = $('a[id^="line_u"][href]');
    } else if (site === 'fldpj') {
        items = $('li[id^="line_u9"]').find('a');
    } else {
        $('.Next, .rjxw_left, .pb_sys_common').remove();
        items = $('.txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili').find('a');
    }

    items = items.toArray().map((item): DataItem => {
        const $item = $(item);

        const result: DataItem = {
            link: new URL($item.attr('href')!, currentUrl).href,
            title: '',
        };

        if (site === 'news') {
            result.title = $item.text();
            result.pubDate = getCurrentListDate($, $item);
        } else if (['panjin', 'xsgzb', 'pjteach', 'pjxqzwb', 'perdep'].includes(site) && $item.find('h2, h3').length) {
            result.title = $item.find('h2, h3').first().text();
            result.pubDate = getCurrentListDate($, $item);
        } else if (site === 'fldpj') {
            result.title = $item.find('em').text();
            result.pubDate = timezone(parseDate($item.find('span').text()), 8);
        } else {
            const dateRegex = /(\d{4}[/年-]\d{2}[/月-]\d{2})/;

            let dateMatch = $item.parent().text().match(dateRegex);
            if (!dateMatch) {
                dateMatch = $item.parent().parent().text().match(dateRegex);
            }

            result.title = $item.find('h3, h4').first().text() || ($item.text().trim() === '' ? $item.next().text() : $item.text());
            if (dateMatch) {
                result.pubDate = timezone(parseDate(dateMatch[1].replaceAll(/年|月/g, '-')), 8);
            }
        }

        return result;
    });

    const limit = getRouteLimit(ctx, 50);
    if (ctx.req.query('sorted') === 'false') {
        items = items.slice(0, limit);
    } else if (items.every((item) => item.pubDate && !Number.isNaN(parseDate(item.pubDate).getTime()))) {
        items.sort((a, b) => parseDate(b.pubDate).getTime() - parseDate(a.pubDate).getTime());
        items = items.slice(0, limit);
    } else {
        items = items.slice(0, Math.max(50, limit));
    }

    items = await pMap<DataItem, DataItem>(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('meta[name="pageTitle"]').attr('content') || item.title;
                    item.description = content('.v_news_content, .conbox').html();
                } catch {
                    // For example: http://dutdice.dlut.edu.cn/nry.jsp?urltype=news.NewsContentUrl&wbtreeid=1006&wbnewsid=9820
                    // Preserve list metadata when article details require intranet access.
                }
                return item;
            }),
        { concurrency: 4 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
