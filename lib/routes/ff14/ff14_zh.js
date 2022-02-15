const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
module.exports = async (ctx) => {
    const referer = 'http://ff.sdo.com/web8/index.html';
    const type = ctx.params.type;

    const type_number = {
        news: '5310',
        announce: '5312',
        events: '5311',
        advertise: '5313',
        all: '5310,5312,5311,5313,5309',
    };

    const response = await got({
        method: 'get',
        url: `http://api.act.sdo.com/UnionNews/List?gameCode=ff&category=${type_number[type]}&pageIndex=0&pageSize=50`,
        headers: {
            Referer: referer,
        },
    });

    const data = response.data.Data;

    ctx.state.data = {
        title: '最终幻想14（国服）新闻中心',
        link: referer + '#/newstab/newslist',
        description: '《最终幻想14》是史克威尔艾尼克斯出品的全球经典游戏品牌FINAL FANTASY系列的最新作品，IGN获得9.2高分！全球累计用户突破1600万！',
        item: data.map(({ Title, Summary, Author, PublishDate, HomeImagePath }) => ({
            title: Title,
            link: Author,
            description: `<img src="${HomeImagePath}"/><br>${Summary}`,
            pubDate: timezone(new Date(PublishDate), +8),
        })),
    };
};
