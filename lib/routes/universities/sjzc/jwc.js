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
    const result = {};
    try {
        const response = await got({
            method: 'get',
            url: link,
            responseType: 'buffer',
        });
        const pageContent = transcode(response.data);
        result.description = pageContent('.content').children('.wz_box').html();
        const dateString = pageContent('.content').children('.liulan').text().match(/\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}/)[0];
        result.pubDate = timezone(parseDate(dateString, 'YYYY/M/D HH:mm:ss'), +8);
    } catch (error) {
        result.description = '<p>文章获取失败 (┯_┯)</p>';
        result.pubDate = new Date();
    }
    return result;
}

module.exports = async (ctx) => {
    const config = {
        siteUrl: 'http://210.31.249.6',
        siteName: '石家庄学院教务处',
        section: {
            jwdt: {
                name: '教务动态',
                oldclassId: 1,
                classId: 1
            },
            tzgg: {
                name: '通知公告',
                oldclassId: 51,
                classId: 51
            }
        },
    };
    const type = ctx.params.type || 'tzgg';
    const indexUrl = `${config.siteUrl}/NewsList.aspx?tit=${config.section[type].name}&oldclassId=${config.section[type].oldclassId}&classId=${config.section[type].classId}`;

    const response = await got({
        method: 'get',
        url: indexUrl,
        responseType: 'buffer',
    });

    const $ = transcode(response.data);
    const item = await Promise.all(
        $('.tycon')
            .find('ul')
            .find('li')
            .slice(0, 20)
            .map(async (i, e) => {
                const a = $(e).find('a');
                const title = a.text() + '-' + config.section[type].name + '-' + config.siteName;
                const link = config.siteUrl + '/' + a.attr('href');
                const guid = link;
                const {description, pubDate} = await ctx.cache.tryGet(link, async () => await getArticleContent(link));
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
