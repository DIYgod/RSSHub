const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const listRes = await axios({
        method: 'get',
        url: 'http://i.match.qq.com/ninjayc/dajia?action=getwenz&p=0&num=20&callback=',
        headers: {
            Referer: 'http://dajia.qq.com/m/index.html',
        },
    });

    const storyList = JSON.parse(listRes.data.slice(1, -2)).data;
    const resultItem = await Promise.all(
        storyList.map(async (story) => {
            const url = story.n_mobile_url;
            const item = {
                title: story.n_title,
                description: '',
                link: url,
                author: story.name,
                pubDate: new Date(story.n_publishtime).toUTCString(),
            };
            const key = `tx-dajia: ${url}`;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDetail = await axios({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                    },
                });
                const $ = cheerio.load(storyDetail.data);
                $('#articleContent img').each(function(_, item) {
                    const $img = $(item);
                    const src = $img.attr('src');

                    if (!(src.startsWith('https://') || src.startsWith('http://'))) {
                        $img.attr('src', `https:${src}`);
                    }

                    $img.attr('referrerpolicy', 'no-referrer');
                });

                item.description = $('#articleContent').html();
                ctx.cache.set(key, item.description, 24 * 60 * 60);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '腾讯大家',
        link: 'http://dajia.qq.com/',
        item: resultItem,
    };
};
