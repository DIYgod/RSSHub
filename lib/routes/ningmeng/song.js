const axios = require('@/utils/axios');
const cheerio = require('cheerio');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'http://www.ningmeng.name/archives/category/%E7%A7%81%E6%88%BF%E6%AD%8C';
    const res = await axios.get(url);
    const $$ = cheerio.load(res.data);
    const postUrls = $$('.site-main .posts-wrapper .grid-item a')
        .slice(0, 3)
        .map((i, el) => $$(el).attr('href'))
        .get();

    let items = [];

    await Promise.all(
        postUrls.map(async (postUrl) => {
            const postRes = await axios.get(postUrl);
            const $ = cheerio.load(postRes.data);

            let time = $('.iconfont.icon-shijian + span.count').text();
            time = time ? new Date(time) : new Date();
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
            const pubDate = time.toUTCString();

            const content = $('.entry-content');

            const mp3s = content.find('.karma-by-kadar__simple-player');
            const mp3Urls = mp3s.map((i, el) => $(el).attr('data-src')).get();

            const images = content.find('img');
            const imageUrls = images.map((i, el) => $(el).attr('src')).get();

            const playerTextRe = /\n*play_circle_filledpause_circle_filledvolume_downvolume_upvolume_off\n*/g;
            const songSplitterRe = /—+.+—+/g;
            const texts = content
                .text()
                .replace(songSplitterRe, '')
                .split(playerTextRe)
                .map((p) => p.trim().split(/\n+/));

            const out = await Promise.all(
                mp3Urls.map(async (mp3Url, i) => {
                    const cache = await ctx.cache.get(mp3Url);
                    if (cache) {
                        return JSON.parse(cache);
                    }

                    const ss = mp3Url.split('/');
                    const filename = ss[ss.length - 1].split('.')[0];

                    const [title, artist] = filename.split('-');
                    const description = [`<img src="${imageUrls[i]}" />`, `<h4>${texts[i][0]}</h4>`, `<p>${texts[i][1]}</p>`].join();

                    const song = {
                        title: unescape(title),
                        author: unescape(artist),
                        link: mp3Url,
                        guid: mp3Url,
                        description,
                        pubDate,
                    };

                    ctx.cache.set(mp3Url, JSON.stringify(song));
                    return song;
                })
            );

            items = items.concat(out);
        })
    );

    ctx.state.data = {
        title: '柠檬私房歌',
        link: 'http://www.ningmeng.name',
        item: items,
    };
};
