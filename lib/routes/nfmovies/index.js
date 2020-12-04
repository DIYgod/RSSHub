const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.nfmovies.com/';
const mv_slot = 'https://www.nfmovies.com/video/?UID-0-0.html';
const url_slot = 'https://www.nfmovies.com/list/?ID.html';

const idProps = {
    0: '首页',
    1: '电影',
    2: '电视剧',
    3: '综艺',
    4: '动漫',
    5: '奈菲独家',
};

module.exports = async (ctx) => {
    const id = ctx.params.id || '0';
    let t_url = '';
    if (id === '0') {
        t_url = host;
    } else if (id === '5') {
        t_url = 'https://www.nfmovies.com/search.php?searchtype=5&order=time&player=%E5%A5%88%E8%8F%B2%E7%8B%AC%E5%AE%B6%E9%AB%98%E6%B8%85%E7%89%87%E6%BA%90';
    } else {
        t_url = url_slot.replace('ID', id);
    }

    const response = await got({
        method: 'get',
        url: t_url,
    });

    const $ = cheerio.load(response.data);
    const items = [];
    $('.col-md-2').each(function () {
        const item = $(this);
        const link = mv_slot.replace(
            'UID',
            item
                .find('a')
                .attr('href')
                .match(/\d{4,}/g)
        );
        const src = host + item.children('a').attr('data-original');
        items.push({
            title: item.find('h5').text(),
            description: `<img src="` + src + `"/><br>` + item.html(),
            link: link,
        });
    });

    ctx.state.data = {
        title: `${idProps[id]} - 奈菲影视`,
        link: t_url,
        description: `${idProps[id]} - 奈菲影视-永久免费无广告的福利超清影视站，没有套路，完全免费！`,
        item: items,
    };
};
