const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

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
        return pageContent('#cont').html();
    } catch (error) {
        return '<p>文章获取失败 (┯_┯)</p>';
    }
}

module.exports = async (ctx) => {
    const config = {
        siteUrl: 'https://www.sjzc.edu.cn',
        siteName: '石家庄学院',
        section: {
            xxxw: {
                name: '学校新闻',
                timestamp: 1456989730483,
            },
            tzgg: {
                name: '通知公告',
                timestamp: 1456989740400,
            },
            xsjl: {
                name: '学术交流',
                timestamp: 1456989751552,
            },
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
        $('table[style]')
            .find('tbody')
            .find('tr')
            .slice(0, 20)
            .map(async (i, e) => {
                const a = $(e).find('td[align=left]').find('a');
                const title = a.text() + '-' + config.section[type].name + '-' + config.siteName;
                const link = config.siteUrl + a.attr('href');
                const guid = link;
                const pubDate = new Date(link.match(/\d+\.html/)[0].replace(/\.html/, '') * 1).toUTCString();
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
