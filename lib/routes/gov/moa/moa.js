const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

const hostUrl = 'http://www.moa.gov.cn/';
const hostUrlObj = new URL(hostUrl); // 用于在下面判断host

module.exports = async (ctx) => {
    const rawSuburl = ctx.params.suburl;
    const suburl = rawSuburl.slice(-1) === '/' ? rawSuburl : rawSuburl + '/';

    // 特殊处理两个, 其他的栏目都可以找到那种一个列表下去的目录
    if (suburl === 'xw/tpxw/') {
        // 图片新闻
        ctx.state.data = await dealChannel(ctx, suburl, {
            channelTitleSelector: '.pub-media2-head',
            listSelector: '.tupian_list li',
            titleSelector: 'a[class="block w_fill ellipsis adc ahc"]',
            dateSelector: 'span',
        });
    } else if (suburl === 'govpublic/') {
        // 公开公告
        ctx.state.data = await dealChannel(ctx, 'govpublic/1/index.htm', {
            channelTitleSelector: 'title',
            listSelector: '.gongkai_centerRList li',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    } else {
        ctx.state.data = await dealChannel(ctx, suburl, {
            channelTitleSelector: '.pub-media1-head-title',
            listSelector: '.ztlb',
            titleSelector: 'a',
            dateSelector: 'span',
        });
    }
};

// 处理文章列表, 从那里获得一堆要爬取的页面, 然后爬取
async function dealChannel(ctx, suburl, selectors) {
    const { channelTitleSelector, listSelector, titleSelector, dateSelector } = selectors;

    // 为了与下面解析相对链接的dealLink配合, 这里末尾必须保证有一条斜杠
    const url = hostUrl + suburl;
    const respone = await got.get(url);
    const $ = cheerio.load(respone.data);

    const channelTitle = $(channelTitleSelector).text();

    const pageInfos = $(listSelector)
        .map((i, e) => {
            const element = $(e);
            const titleElement = element.find(titleSelector);

            const title = titleElement.text();
            const [link, pageType] = dealLink(titleElement, url);
            const dateraw = element.find(dateSelector).text().trim();

            return {
                pageType: pageType,
                title: title,
                link: link,
                // 先在这里获取一个精确到日的时间
                // 如果是正常文章的话可以在那里提取更精确的时间
                // 如果是公示文章或者站外文章的话只能用这个保底了
                pubDate: date(dateraw),
            };
        })
        .get();

    const items = await Promise.all(
        pageInfos.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            if (item.pageType === 'normal') {
                // 正常文章
                item = await dealNormalPage(link, item);
            } else if (item.pageType === 'govpublic') {
                // 公示文章
                item = await dealGovpublicPage(link, item);
            } else {
                // 外部文章
                item.description = `外部链接: ${item.link}`;
                item.author = 'unknown';
            }

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    return {
        title: `中华人民共和国农业农村部 - ${channelTitle}`,
        link: url,
        item: items,
    };
}

// 处理正常文章, 例子: http://www.moa.gov.cn/gk/rsxx_1/202004/t20200421_6342037.htm
async function dealNormalPage(link, item) {
    const reponse = await got.get(link);
    const $ = cheerio.load(reponse.data);
    const metaElements = $('.bjjMAuthorBox span.dc_3').toArray();

    // 政府网站变动不频繁, 写死第几个应该没有多大关系
    const author = $(metaElements[1]).text();
    const source = $(metaElements[2]).text();
    item.author = `${author} ${source}`;

    // 对于这个网站内的链接, 能提供更精确的时间
    // 这个的日期跟时间之间的空格数量好像会乱变的
    const exactTime = $(metaElements[0]).text();
    const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(exactTime);
    const timeMatch = /\d{2}:\d{2}/.exec(exactTime);
    item.pubDate = date(`${dateMatch[0]} ${timeMatch[0]}`);

    item.description = $('.arc_body').html();

    return item;
}

// 处理那种带索引号的公示文章, 例子: http://www.moa.gov.cn/govpublic/XZQYJ/202004/t20200420_6341913.htm
async function dealGovpublicPage(link, item) {
    const respone = await got.get(link);
    const $ = cheerio.load(respone.data);

    const head = $('ul.head');
    const body = $('.arc_body');

    // 日期时间作者等详细信息被包含在了head里面
    // 况且都是政府部门, 提取作者信息无多大意义(还没有特别在页面标注出来), 干脆写在正文
    // 而且我也搞不懂到底是发布部门算作者还是写出来公告的部门算还是那个人算...

    item.description = head.html() + body.html();

    return item;
}

// 处理相对url 和 按链接对文章类型进行分类
function dealLink(element, url) {
    const rawLink = element.attr('href');
    const { host, href } = new URL(rawLink, url);

    // host不同的是外部文章, outside
    // url里带govpublic的都是公示文章, govpublic
    // 其他的都算普通文章, normal
    let pageType = null;
    if (host !== hostUrlObj.host) {
        pageType = 'outside';
    } else {
        if (href.indexOf('govpublic') !== -1) {
            pageType = 'govpublic';
        } else {
            pageType = 'normal';
        }
    }

    return [href, pageType];
}
