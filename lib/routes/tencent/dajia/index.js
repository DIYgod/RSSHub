const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

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
            const mobileUrl = story.n_mobile_url;
            const pcUrl = story.n_url;
            const item = {
                title: story.n_title,
                description: '',
                link: pcUrl,
                guid: mobileUrl,
                author: story.name,
                pubDate: new Date(story.n_publishtime).toUTCString(),
            };
            const key = `tx-dajia: ${mobileUrl}`;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDetail = await axios({
                    method: 'get',
                    url: pcUrl,
                    headers: {
                        Referer: pcUrl,
                    },
                    responseType: 'arraybuffer',
                });
                const $ = cheerio.load(iconv.decode(storyDetail.data, 'gb2312'));
                $('#articleContent img').each(function(_, item) {
                    const $img = $(item);
                    const src = $img.attr('src');

                    if (!(src.startsWith('https://') || src.startsWith('http://'))) {
                        $img.attr('src', `https:${src}`);
                    }

                    $img.attr('referrerpolicy', 'no-referrer');
                });

                item.description = $('#articleContent').html();
                ctx.cache.set(key, item.description);
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
