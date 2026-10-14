import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const hostUrl = 'http://www.moa.gov.cn/';
const hostUrlObj = new URL(hostUrl); // Used to classify links by hostname.

export const route: Route = {
    path: '/suburl/:suburl{.+}',
    categories: ['government'],
    example: '/gov/moa/suburl/gk/zcjd/',
    radar: [
        {
            title: '政策解读',
            source: ['www.moa.gov.cn/gk/zcjd/', 'www.moa.gov.cn/'],
            target: '/suburl/gk/zcjd/',
        },
        {
            title: '农业农村部动态',
            source: ['www.moa.gov.cn/xw/zwdt/'],
            target: '/suburl/xw/zwdt/',
        },
    ],
    parameters: { suburl: '下级目录，请使用最下级的目录' },
    name: '新闻',
    maintainers: ['Origami404', 'lyqluis'],
    handler,
    url: 'moa.gov.cn/',
    description: `更多例子：

- \`农业农村部动态\`的网页链接是\`http://www.moa.gov.cn/xw/zwdt/\`, 对应的\`suburl\`是\`xw/zwdt\`
- \`财务公开\`的网页链接是\`http://www.moa.gov.cn/gk/cwgk_1/\`, 对应的\`suburl\`是\`gk/cwgk_1\`
- 像[政策法规](http://www.moa.gov.cn/gk/zcfg/)这种页面 (\`http://www.moa.gov.cn/gk/zcfg/\`), 它**不是**一个合法的分类目录，它是\`法律\`, \`行政法规\`, \`部门规章\`等一堆栏目的集合，这时候请点开对应栏目的\`更多 >>\`进入栏目的最下级目录，再根据上面的规则提取\`suburl\`
- 特别地，\`图片新闻\`对应的\`suburl\`为\`xw/tpxw/\`, \`最新公开\`对应的\`suburl\`为\`govpublic\`, \`数据>最新发布\`对应的\`suburl\`为\`sj/zxfb\``,
};

async function handler(ctx) {
    const rawSuburl = ctx.req.param('suburl');
    const suburl = rawSuburl.slice(-1) === '/' ? rawSuburl : rawSuburl + '/';
    // Handle specialized channels separately from ordinary article lists.
    if (suburl === 'xw/tpxw/') {
        // Photo news.
        return await dealChannel(suburl, {
            channelTitleSelector: '.pub-media2-head',
            listSelector: '.tupian_list li',
            titleSelector: 'a[class="block w_fill ellipsis adc ahc"]',
            dateSelector: 'span',
        });
    }
    if (suburl.startsWith('sj/zxfb')) {
        // Latest data releases.
        return await dealLatestDataChannel();
    }
    if (suburl.startsWith('gk')) {
        // Disclosure articles.
        return await dealChannel(suburl, {
            channelTitleSelector: 'title',
            listSelector: '.commonlist li',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    }
    if (suburl.startsWith('govpublic')) {
        // Latest disclosures.
        return await dealChannel('govpublic/1/index.htm', {
            channelTitleText: '最新公开',
            listSelector: '.commonlist li',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    }
    return await dealChannel(suburl, {
        channelTitleSelector: '.pub-media1-head-title',
        listSelector: '.ztlb',
        titleSelector: 'a',
        dateSelector: 'span',
    });
}

// Fetch the channel list and its article details.
async function dealChannel(suburl, selectors) {
    const { channelTitleSelector, listSelector, titleSelector, dateSelector, channelTitleText } = selectors;

    // Keep a trailing slash so dealLink can resolve relative URLs.
    const url = suburl.startsWith('http') ? suburl : hostUrl + suburl;
    const response = await got.get(url);
    const $ = load(response.data);

    const channelTitle = channelTitleText ?? $(channelTitleSelector).text();

    const pageInfos = $(listSelector)
        .toArray()
        .map((e): DataItem & { pageType: string; link: string } => {
            const element = $(e);
            const titleElement = element.find(titleSelector);

            const title = titleElement.text();
            const [link, pageType] = dealLink(titleElement, url);
            const dateraw = element.find(dateSelector).text().trim();

            return {
                pageType,
                title,
                link,
                // Keep the calendar date from the list as a fallback.
                // Ordinary articles may declare a more precise publication time.
                // Disclosure and external articles may only expose the list date.
                pubDate: dateraw ? (/^\d{4}/.test(dateraw) ? timezone(parseDate(dateraw), 8) : parseRelativeDate(dateraw)) : undefined,
            };
        });

    const items = await Promise.all(
        pageInfos.map(async (item) => {
            const link = item.link;

            const cacheIn = await cache.get(link);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            if (item.pageType === 'normal') {
                // Ordinary articles.
                item = await dealNormalPage(link, item);
            } else if (item.pageType === 'govpublic') {
                // Disclosure articles.
                item = await dealGovpublicPage(link, item);
            } else {
                // External articles.
                item.description = `外部链接：${item.link}`;
            }

            cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    return {
        title: `中华人民共和国农业农村部 - ${channelTitle}`,
        link: url,
        item: items.map(({ pageType: _pageType, ...item }) => item),
    };
}

// Parse an ordinary article.
async function dealNormalPage(link, item) {
    const response = await got.get(link);
    const $ = load(response.data);

    // Live interviews.
    if (link.includes('zbft')) {
        const pageHeader = $('.nybzb').html() ?? '';
        const pics = $('.tpsl').html() ?? '';
        const content = $('.wzsl').html() ?? '';

        item.description = pageHeader + pics + content;
        return item;
    }

    // normal news
    item.title = $('meta[name="ArticleTitle"]').attr('content') || item.title;
    const metaElements = $('.bjjMAuthorBox span.dc_2').toArray();

    // The page header places the source in its first field.
    const author = $(metaElements[1]).text();
    const source = $(metaElements[2]).text();
    item.author = `${author} ${source}`;

    // Prefer the precise publication time declared by the article.
    // Whitespace between the date and time can vary.
    const exactTime = $(metaElements[0]).text();
    const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(exactTime);
    const timeMatch = /\d{2}:\d{2}/.exec(exactTime);
    const pubDate = $('meta[name="PubDate"]').attr('content');
    if (pubDate) {
        item.pubDate = timezone(parseDate(pubDate), 8);
    } else if (dateMatch && timeMatch) {
        item.pubDate = timezone(parseDate(`${dateMatch[0]} ${timeMatch[0]}`), 8);
    }

    item.description = $('.arc_body').html();

    return item;
}

// Parse disclosure articles with an index number.
async function dealGovpublicPage(link, item) {
    if (item.link.endsWith('.pdf')) {
        return item;
    }
    const response = await got.get(link);
    const $ = load(response.data);

    item.title = $('meta[name="ArticleTitle"]').attr('content') || item.title;
    const body = $('.gsj_htmlcon_bot');
    const dateMatch = $('.pubtime')
        .text()
        .match(/：(\d{4})[|年-](\d{1,2})[|月-](\d{1,2})日?/);
    const pubDate = $('meta[name="PubDate"]').attr('content');
    const [, author] = $('.pubtime.source')
        ?.text()
        ?.match(/：(.+)/) ?? [null, ''];

    if (pubDate) {
        item.pubDate = timezone(parseDate(pubDate), 8);
    } else if (dateMatch) {
        const [, year, month, date] = dateMatch;
        item.pubDate = timezone(parseDate(`${year}-${month}-${date}`), 8);
    }
    item.author = author;
    item.description = body.html();
    return item;
}

async function dealLatestDataChannel() {
    const res = await got({
        url: 'http://zdscxx.moa.gov.cn:8080/nyb/getMessages',
        method: 'post',
        json: {
            page: 1,
            rows: 20,
            type: '最新发布',
            isLatestMessage: true,
        },
    });
    const table: Array<DataItem & { id: string; date?: string }> = res.data.result.table;
    const items = await pMap(
        table,
        (item) => {
            const { date, id } = item;
            item.pubDate = date ? timezone(parseDate(date), 8) : undefined;
            const link = (item.link = `http://zdscxx.moa.gov.cn:8080/nyb/pc/messageView.jsp?id=${id}`);

            return cache.tryGet(link, async () => {
                const { content, source } = await getLatestDataArticleDetail(id);

                item.description = content;
                item.author = source;

                return item;
            });
        },
        { concurrency: 3 }
    );
    return {
        title: '中华人民共和国农业农村部 - 数据 - 最新发布',
        link: 'http://zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp',
        item: items.map(({ date: _date, ...item }) => item),
    };
}

async function getLatestDataArticleDetail(id) {
    const res = await got({
        url: 'http://zdscxx.moa.gov.cn:8080/nyb/getMessagesById',
        method: 'post',
        form: {
            id,
        },
    });
    return res.data.result;
}

// Resolve relative URLs and classify article layouts.
function dealLink(element, url) {
    const rawLink = element.attr('href');
    const { host, href } = new URL(rawLink, url);

    // A different hostname identifies an external article.
    // The govpublic path identifies a disclosure article.
    // Other paths use the ordinary article layout.
    let pageType: string;
    if (host === hostUrlObj.host) {
        pageType = href.includes('gk') || href.includes('govpublic') ? 'govpublic' : 'normal';
    } else {
        pageType = 'outside';
    }

    return [href, pageType];
}
