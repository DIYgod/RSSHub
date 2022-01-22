const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const config = require('@/config').value;

const cateUrlMap = {
    lastupdate: 'https://www.wenku8.net/modules/article/toplist.php?sort=lastupdate',
    fullflag: 'https://www.wenku8.net/modules/article/articlelist.php?fullflag=1',
    postdate: 'https://www.wenku8.net/modules/article/toplist.php?sort=postdate',
    anime: 'https://www.wenku8.net/modules/article/toplist.php?sort=anime',
    allvisit: 'https://www.wenku8.net/modules/article/toplist.php?sort=allvisit',
    articlelist: 'https://www.wenku8.net/modules/article/articlelist.php',
};

const cateTitleMap = {
    lastupdate: '今日更新',
    fullflag: '完结全本',
    postdate: '新书一览',
    anime: '动画化作品',
    allvisit: '热门轻小说',
    articlelist: '轻小说列表',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'lastupdate';
    const response = await got({
        method: 'get',
        url: cateUrlMap[category],
        responseType: 'buffer',
        headers: {
            UserAgent: config.ua,
            cookie: config.wenku8.cookie,
        },
    });

    const responseHtml = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(responseHtml);
    const items = $('td > div')
        .map((_, item) => ({
            title: $(item).find('b > a').text(),
            link: $(item).find('b > a').attr('href'),
            description: $(item).find('img').html() + $(item).find('div:nth-child(2)').remove('b').end().html(),
        }))
        .get();

    ctx.state.data = {
        title: `轻小说文库 - ${cateTitleMap[category]}`,
        link: cateUrlMap[category],
        item: items,
    };
};
