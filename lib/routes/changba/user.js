const got = require('@/utils/got');
const cheerio = require('cheerio');
const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://changba.com/wap/index.php?s=${userid}`;
    const response = await got({
        method: 'get',
        url: url,
        headers: headers,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.user-work .work-info').get();
    const author = $('div.user-main-info > span.txt-info > a.uname').text();
    const authorimg = $('div.user-main-info > .poster > img').attr('data-src');

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const link = $('a').attr('href');
            const songid = await ctx.cache.tryGet(
                link,
                async () => {
                    const result = await got({
                        method: 'get',
                        url: link,
                        headers: headers,
                    });

                    const re = /workid: '\d+'/;
                    let workid = result.data.match(re)[0];
                    workid = workid.split("'")[1];
                    return workid;
                },
                60 * 60 * 24
            );
            const mp3 = `http://upscuw.changba.com/${songid}.mp3`;
            const description = $('div.des').text() + `<br><audio id="audio" src="${mp3}" preload="metadata"></audio>`;
            const itunes_item_image = $('div.work-cover').attr('style').replace(')', '').split('url(')[1];
            const single = {
                title: $('.work-title').text(),
                description: description,
                link: link,
                author: author,
                itunes_item_image: itunes_item_image,
                enclosure_url: mp3,
                enclosure_type: 'audio/mpeg',
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '唱吧',
    };
};
