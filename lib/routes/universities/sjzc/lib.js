const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const transcode = (buffer) => {
    const data = iconv.decode(buffer, 'utf-8');
    return cheerio.load(data);
};

async function getArticleContent(link) {
    try {
        const response = await got({
            method: 'get',
            url: link,
            responseType: 'buffer',
        });
        const pageContent = transcode(response.data);
        return pageContent('.articlecontent')
            .children('ul')
            .children('li')
            .first().html();
    } catch (error) {
        return  '<p>文章获取失败 (┯_┯)</p>';
    }
}

module.exports = async (ctx) => {
    const config = {
        siteUrl: 'https://lib.sjzc.edu.cn',
        siteName: '石家庄学院图书馆',
        section: {
            xwdt: {
                name: '新闻动态',
                indexUrl: '/index/list/lib/123/1388/1388/0/15/1.html'
            },
            tzgg: {
                name: '通知公告',
                indexUrl: '/index/list/lib/123/1389/1389/0/15/1.html'
            },
            syzy: {
                name: '试用资源',
                indexUrl: '/index/list/lib/123/1398/1391/0/15/1.html'
            }
        },
    };
    const type = ctx.params.type || 'tzgg';
    const indexUrl = config.siteUrl + config.section[type].indexUrl;

    const response = await got({
        method: 'get',
        url: indexUrl,
        responseType: 'buffer',
    });
    const $ = transcode(response.data);
    const item = await Promise.all(
        $('.cmsList')
            .find('ul')
            .find('li')
            .slice(1, 16)
            .map(async (i, e) => {
                const a = $(e).find('a');
                const len = a.text().length;
                const dateString = a.text().substring(len - 10, len);
                const pubDate = timezone(parseDate(dateString, 'YYYY-MM-DD'), +8);
                const title = a.attr('title') + '-' + config.section[type].name + '-' + config.siteName;
                const link = config.siteUrl + a.attr('href');
                const guid = link;
                const description = await ctx.cache.tryGet(link, async () => await getArticleContent(link));
                return Promise.resolve({ title, link, pubDate, guid, description });
            })
            .get()
    );

    ctx.state.data = {
        title: config.siteName + '-' + config.section[type].name,
        link: config.siteUrl,
        item: item,
    };
};
