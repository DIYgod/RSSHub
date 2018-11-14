const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://v.qq.com/detail/${id[0]}/${id}.html`;
    const page = await axios.get(link);
    const $ = cheerio.load(page.data);
    const last = $('._tabsNav > .item')
        .last()
        .attr('data-range')
        .split('-')[1];
    const episodes = await axios.get(`https://s.video.qq.com/get_playsource?id=${id}&plat=2&type=4&data_type=2&video_type=3&range=1-${last}&plname=qq&otype=json&num_mod_cnt=20&callback=a&_t=${Date.now()}`);
    const playList = JSON.parse(episodes.data.slice(2, -1)).PlaylistItem.videoPlayList.reverse();
    const items = playList.map((video) => ({
        title: video.title,
        link: video.playUrl,
        description: `
                <iframe frameborder="0" src="https://v.qq.com/txp/iframe/player.html?vid=${video.id}" allowFullScreen="true"></iframe>
            `,
    }));

    ctx.state.data = {
        title: $('title').text(),
        link,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
};
