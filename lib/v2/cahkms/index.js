const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const titles = {
    '01': '关于我们',
    '02': '港澳新闻',
    '03': '重要新闻',
    '04': '顾问点评、会员观点',
    '05': '专题汇总',
    '06': '港澳时评',
    '07': '图片新闻',
    '08': '视频中心',
    '09': '港澳研究',
    10: '最新书讯',
    11: '研究资讯',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '03';

    const rootUrl = 'http://www.cahkms.org';
    const currentUrl = `${rootUrl}/HKMAC/indexMac/getRightList?dm=${category}&page=1&countPage=${ctx.query.limit ?? 10}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data
        .filter((item) => item.ID)
        .map((item) => ({
            title: item.TITLE,
            description: `<p>${item.GJZ}</p>`,
            pubDate: timezone(parseDate(item.JDRQ), +8),
            link: `${rootUrl}/HKMAC/indexMac/getWzxx?id=${item.ID}`,
        }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.author = detailResponse.data.WZLY;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    rootUrl,
                    content: detailResponse.data.CONTENT,
                    image: detailResponse.data.URL,
                    files: detailResponse.data.fjlist,
                    video: detailResponse.data.VIDEO.indexOf('.mp4') > 0 ? detailResponse.data.VIDEO : null,
                });
                item.link = `${rootUrl}/HKMAC/webView/mc/AboutUs_1.html?${category}&${titles[category]}`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[category]} - 全国港澳研究会`,
        link: currentUrl,
        item: items,
    };
};
