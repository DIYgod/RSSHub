const got = require('@/utils/got');

module.exports = async (ctx) => {
    const referer = 'http://ff.sdo.com/web8/index.html'
    const response = await got({
        method: 'get',
        url: `http://api.act.sdo.com/UnionNews/List?gameCode=ma&category=5309,5310,5311,5312,5313&pageIndex=0&pageSize=70&callback=_jsonpjfzvowq9x8`,
        headers: {
            UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
            Referer: referer
        },
    });

    const data = response.data.data

    ctx.state.data = {
        title: '最终幻想14（国服）新闻中心',
        link: referer + '#/newstab/newslist',
        description: '《最终幻想14》是史克威尔艾尼克斯出品的全球经典游戏品牌FINAL FANTASY系列的最新作品，IGN获得9.2高分！全球累计用户突破1600万！',
        item: data.map(({ Title, Summary, Author, PublishDate, HomeImagePath }) => ({
            title: Title,
            link: Author,
            description: `
                <img referrerpolicy="no-referrer" src="${HomeImagePath}"><br>
                ${Summary}<br>
                ${PublishDate}`,
        })),
    };
};