const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { area = '' } = ctx.params;
    const title = '豆瓣最新增加的音乐';
    let data;

    if (area === '') {
        const url = 'https://music.douban.com/latest';
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const list = $('.dlist').get();

        data = {
            title,
            link: url,
            item: list.map((item) => ({
                title: $(item)
                    .find('.pl2')
                    .text(),
                link: $(item)
                    .find('.pl2')
                    .attr('href'),
                description: $(item).html(),
            })),
        };
    } else {
        const referer = 'https://m.douban.com/music/';
        const mapper = {
            chinese: {
                name: '华语新碟榜',
                path: 'chinese',
            },

            western: {
                name: '欧美新碟榜',
                path: 'occident',
            },

            japankorean: {
                name: '日韩新碟榜',
                path: 'japan_korea',
            },
        };
        const res = await axios({
            method: 'get',
            url: `https://m.douban.com/rexxar/api/v2/subject_collection/music_${mapper[area].path}/items?os=ios&callback=&start=0&count=20&loc_id=0&_=0`,
            headers: {
                Referer: referer,
            },
        });

        data = {
            title: `${title}-${mapper[area].name}`,
            link: `${referer}new${area}`,
            item: res.data.subject_collection_items.map((item) => {
                const title = `${item.title}-${item.info}`;
                const link = `https://music.douban.com/subject/${item.id}/`;
                const description = `
                    <img src="${item.cover.url}" referrerpolicy="no-referrer" /><br>
                    ${item.recommend_comment}<br>
                    <strong>评分:</strong> ${item.rating.value.toFixed(1)}
                `;
                const pubDate = new Date(item.pubdate[0]).toUTCString();

                return {
                    title,
                    link,
                    description,
                    pubDate,
                };
            }),
        };
    }

    ctx.state.data = data;
};
