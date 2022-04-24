const got = require('@/utils/got');
const cheerio = require('cheerio');

const categoryCodes = {
    latest: '最新文章',
    fulishe: '福利社',
    qiuchuchu: '求出处',
    taotuji: '套图集',
    menshijian: '门事件',
    neihantu: '内涵图',
    // "zngirls":"宅男女神",
    dianyingxiazai: '电影下载',
    yingshi: '影视资讯',
    dianshiju: '电视剧下载',
    dongman: '动漫下载',
    caidan: '电影彩蛋',
    juqing: '影视剧情',
    zhangzishi: '涨姿势',
    yule: '娱乐',
    mingxing: '明星八卦',
    music: '音乐歌曲',
    games: '游戏',
    software: '电脑软件',
    shishiredian: '实时热点',
    xljt: '心灵鸡汤',
    fhdq: '符号大全',
    guoji: '国际新闻',
    tech: '科技苑',
    other: '其他',
    // "youqiubiying": "有求必应",
};

const host = 'http://www.qtfy9.com';

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const iTitle = categoryCodes[category];
    let link;
    if (category === 'latest') {
        link = host;
    } else {
        link = host + `/${category}`;
    }
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('article')
        .slice(0, 21)
        .map(function () {
            const info = {
                title: $(this).find('header').find('h2').find('a').attr('title'),
                link: $(this).find('header').find('h2').find('a').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);

            const $ = cheerio.load(response.data);
            const description = $('div.txt').html().trim();
            const date = $('time').text();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${iTitle}-且听风吟福利`,
        link,
        item: out,
    };
};
