const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const transcode = (buffer) => {
    const data = iconv.decode(buffer, 'gb2312');
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
        return pageContent('#conN').html();
    } catch (error) {
        return '<p>文章获取失败 (┯_┯)</p>';
    }
}

module.exports = async (ctx) => {
    const config = {
        siteUrl: 'https://xxzx.sjzc.edu.cn',
        siteName: '石家庄学院信息中心',
        section: {
            tzgg: {
                name: '通知公告',
                timestamp: 1579491799567,
            }
        },
    };
    const type = ctx.params.type || 'tzgg';
    const indexUrl = `${config.siteUrl}/col/${config.section[type].timestamp}/index.html`;

    const response = await got({
        method: 'get',
        url: indexUrl,
        responseType: 'buffer',
    });

    const $ = transcode(response.data);
    const item = await Promise.all(
        $('.conRight-list')
            .children('div')
            .slice(0, 15)
            .map(async (i, e) => {
                const a = $(e).find('a');
                const title = a.text() + '-' + config.section[type].name + '-' + config.siteName;
                // 解决文章列表中直接插入外链文章的问题
                if (a.attr('href').startsWith('http')) {
                    const link = a.attr('href');
                    const guid = link;
                    const dateString = $(e).find('div[style="float:right;"]').text().match(/\d{4}-\d{2}-\d{2}/)[0];
                    const pubDate = timezone(parseDate(dateString, 'YYYY-MM-DD'), +8);
                    const description = `<p>这是一个外部链接，请手动打开 ${link}</p>`;
                    return Promise.resolve({ title, link, pubDate, guid, description });
                } else {
                    const link = config.siteUrl + a.attr('href');
                    const guid = link;
                    const pubDate = new Date(link.match(/\d+\.html/)[0].replace(/\.html/, '') * 1).toUTCString();
                    const description = await ctx.cache.tryGet(link, async () => await getArticleContent(link));
                    return Promise.resolve({ title, link, pubDate, guid, description });
                }

            })
            .get()
    );

    ctx.state.data = {
        title: config.siteName + '-' + config.section[type].name,
        link: config.siteUrl,
        item: item,
    };
};
