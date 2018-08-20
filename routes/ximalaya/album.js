const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const formatPubDate = require('../../utils/date.js');

const baseUrl = 'http://www.ximalaya.com';
module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id
    const classify = ctx.params.classify; // 专辑分类
    const apiUrl = `${baseUrl}/revision/album/getTracksList?albumId=${id}&pageNum=1&sort=1`;
    const responseApi = await axios({
        method: 'get',
        url: `${apiUrl}`,
        headers: {
            Host: 'www.ximalaya.com',
            Referer: `${baseUrl}/${classify}/${id}`,
        },
    });
    const responseDom = await axios({
        method: 'get',
        url: `${baseUrl}/${classify}/${id}`,
        headers: {
            Host: 'www.ximalaya.com',
            Referer: `${baseUrl}/${classify}/${id}`,
        },
    });
    const $ = cheerio.load(responseDom.data);
    const title = $('div.info > h1')
        .eq(0)
        .text();
    const cover_url = $('div.album-info>img')
        .eq(0)
        .attr('src');
    const trackList = responseApi.data.data.tracks;
    const items = [];
    for (let i = 0; i < trackList.length; i++) {
        const track = trackList[i];
        const item = {
            title: track.title,
            link: baseUrl + track.url,
            pubDate: formatPubDate(track.createDateFormat),
        };
        items.push(item);
    }
    ctx.state.data = {
        title: `喜马拉雅专辑 - ${title}`,
        link: `${baseUrl}/${classify}/${id}`,
        image: cover_url,
        item: items,
    };
};
