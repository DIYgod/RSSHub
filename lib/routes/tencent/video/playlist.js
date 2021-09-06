const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://v.qq.com/detail/${id[0]}/${id}.html`;
    const page = await got.get(link);
    const $ = cheerio.load(page.data);

    let vtype = 4;
    // 支持地址 https://v.qq.com/detail/8/84842.html
    let items = null;
    if (`${id[0]}` === '8') {
        vtype = 1;
        const episodes = await got.get(`https://s.video.qq.com/get_playsource?id=${id}&plat=2&type=${vtype}&data_type=2&video_type=3&range=1&plname=qq&otype=json&num_mod_cnt=20&callback=a&_t=${Date.now()}`);
        const playList = JSON.parse(episodes.data.slice(2, -1)).playlist[0].videoPlayList;
        items = playList.map((video) => {
            const video_id = video.playUrl.split('=')[1];
            const info = {
                title: video.title,
                link: video.playUrl,
                description: `
                        <iframe src="https://v.qq.com/txp/iframe/player.html?vid=${video_id}" allowFullScreen="true" width="640" height="430"></iframe>
                    `,
            };
            return info;
        });
    } else {
        const episodes = await got.get(`https://s.video.qq.com/get_playsource?id=${id}&plat=2&type=${vtype}&data_type=2&video_type=3&range=1&plname=qq&otype=json&num_mod_cnt=20&callback=a&_t=${Date.now()}`);
        const playList = JSON.parse(episodes.data.slice(2, -1)).PlaylistItem.videoPlayList;
        items = playList.map((video) => ({
            title: video.title,
            link: video.playUrl,
            description: `
                    <iframe  src="https://v.qq.com/txp/iframe/player.html?vid=${video.id}" allowFullScreen="true" width="640" height="430"></iframe>
                `,
        }));
    }

    ctx.state.data = {
        title: $('title').text(),
        link,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
};
