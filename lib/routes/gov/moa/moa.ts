import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const hostUrl = 'http://www.moa.gov.cn/';
const hostUrlObj = new URL(hostUrl); // 用于在下面判断 host

export const route: Route = {
    path: '/moa/:suburl{.+}',
    categories: ['government'],
    example: '/gov/moa/gk/zcjd/',
    radar: [
        {
            source: ['moa.gov.cn/'],
            target: '/moa/:suburl',
        },
    ],
    parameters: { subrul: '下级目录，请使用最下级的目录' },
    name: '中华人民共和国农业农村部 - 新闻',
    maintainers: ['Origami404', 'lyqluis'],
    handler,
    url: 'moa.gov.cn/',
    description: `更多例子：
  公开 - 农业农村部动态：\`/gov/moa/xw/zwdt/\`
  数据 - 最新发布：\`/gob/moa/sj/zxfb\``,
};

async function handler(ctx) {
    const rawSuburl = ctx.req.param('suburl');
    const suburl = rawSuburl.slice(-1) === '/' ? rawSuburl : rawSuburl + '/';
    // 特殊处理两个，其他的栏目都可以找到那种一个列表下去的目录
    if (suburl === 'xw/tpxw/') {
        // 图片新闻
        return await dealChannel(suburl, {
            channelTitleSelector: '.pub-media2-head',
            listSelector: '.tupian_list li',
            titleSelector: 'a[class="block w_fill ellipsis adc ahc"]',
            dateSelector: 'span',
        });
    } else if (suburl.startsWith('sj/zxfb')) {
        // 数据 - 最新发布
        return await dealLatestDataChannel();
    } else if (suburl.startsWith('gk')) {
        // 公开
        return await dealChannel(suburl, {
            channelTitleSelector: 'title',
            listSelector: '.commonlist li',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    } else {
        return await dealChannel(suburl, {
            channelTitleSelector: '.pub-media1-head-title',
            listSelector: '.ztlb',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    }
}

// 处理文章列表，从那里获得一堆要爬取的页面，然后爬取
async function dealChannel(suburl, selectors) {
    const { channelTitleSelector, listSelector, titleSelector, dateSelector } = selectors;

    // 为了与下面解析相对链接的 dealLink 配合，这里末尾必须保证有一条斜杠
    const url = suburl.startsWith('http') ? suburl : hostUrl + suburl;
    const response = await got.get(url);
    const $ = load(response.data);

    const channelTitle = $(channelTitleSelector).text();

    const pageInfos = $(listSelector)
        .map((i, e) => {
            const element = $(e);
            const titleElement = element.find(titleSelector);

            const title = titleElement.text();
            const [link, pageType] = dealLink(titleElement, url);
            const dateraw = element.find(dateSelector).text().trim();

            return {
                pageType,
                title,
                link,
                // 先在这里获取一个精确到日的时间
                // 如果是正常文章的话可以在那里提取更精确的时间
                // 如果是公示文章或者站外文章的话只能用这个保底了
                pubDate: parseRelativeDate(dateraw),
            };
        })
        .get();

    const items = await Promise.all(
        pageInfos.map(async (item) => {
            const link = item.link;

            const cacheIn = await cache.get(link);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            if (item.pageType === 'normal') {
                // 正常文章
                item = await dealNormalPage(link, item);
            } else if (item.pageType === 'govpublic') {
                // 公示文章
                item = await dealGovpublicPage(link, item);
            } else {
                // 外部文章
                item.description = `外部链接：${item.link}`;
            }

            cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    return {
        title: `中华人民共和国农业农村部 - ${channelTitle}`,
        link: url,
        item: items,
    };
}

// 处理正常文章，例子：http://www.moa.gov.cn/xw/zwdt/202309/t20230915_6436615.htm
async function dealNormalPage(link, item) {
    const reponse = await got.get(link);
    const $ = load(reponse.data);
    const metaElements = $('.bjjMAuthorBox span.dc_3').toArray();

    // 政府网站变动不频繁，写死第几个应该没有多大关系
    const author = $(metaElements[1]).text();
    const source = $(metaElements[2]).text();
    item.author = `${author} ${source}`;

    // 对于这个网站内的链接，能提供更精确的时间
    // 这个的日期跟时间之间的空格数量好像会乱变的
    const exactTime = $(metaElements[0]).text();
    const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(exactTime);
    const timeMatch = /\d{2}:\d{2}/.exec(exactTime);
    item.pubDate = parseRelativeDate(`${dateMatch[0]} ${timeMatch[0]}`);

    item.description = $('.arc_body').html();

    return item;
}

// 处理那种带索引号的公示文章，例子：http://www.moa.gov.cn/gk/zcjd/202402/t20240219_6448654.htm
async function dealGovpublicPage(link, item) {
    if (item.link.endsWith('.pdf')) {
        return item;
    }
    const response = await got.get(link);
    const $ = load(response.data);

    const body = $('.gsj_htmlcon_bot');
    const [, year, month, date] = $('.pubtime')
        .text()
        .match(/：(\d{4})[|年-](\d{1,2})[|月-](\d{1,2})日?/);
    const [, author] = $('.pubtime.source')
        ?.text()
        ?.match(/：(.+)/) ?? [null, ''];

    if (year && month && date) {
        item.pubDate = `${year}-${month}-${date}`;
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
    const items = await Promise.all(
        res.data.result.table.map((item) => {
            const { date, id } = item;
            item.pubDate = date;
            const link = (item.link = `http://zdscxx.moa.gov.cn:8080/nyb/pc/messageView.jsp?id=${id}`);

            return cache.tryGet(link, async () => {
                const { content, source } = await getLatestDataArticleDetali(id);

                item.description = content;
                item.author = source;

                return item;
            });
        })
    );
    return {
        title: `中华人民共和国农业农村部 - 数据 - 最新发布`,
        link: 'http://zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp',
        item: items,
    };
}

async function getLatestDataArticleDetali(id) {
    const res = await got({
        url: 'http://zdscxx.moa.gov.cn:8080/nyb/getMessagesById',
        method: 'post',
        form: {
            id,
        },
    });
    return res.data.result;
}

// 处理相对 url 和 按链接对文章类型进行分类
function dealLink(element, url) {
    const rawLink = element.attr('href');
    const { host, href } = new URL(rawLink, url);

    // host 不同的是外部文章，outside
    // url 里带 govpublic 的都是公示文章，govpublic
    // 其他的都算普通文章，normal
    let pageType = null;
    if (host === hostUrlObj.host) {
        pageType = href.includes('gk') || href.includes('govpublic') ? 'govpublic' : 'normal';
    } else {
        pageType = 'outside';
    }

    return [href, pageType];
}
