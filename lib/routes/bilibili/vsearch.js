const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const kw = ctx.params.kw;
    const kw_url = encodeURIComponent(kw);

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/search/type?jsonp=jsonp&search_type=video&highlight=1&keyword=${kw_url}&order=pubdate&duration=0&single_column=0&tids=0`,
        headers: {
            Referer: `https://search.bilibili.com/all?keyword=${kw_url}`,
        },
    });
    const data = response.data.data.result;

    ctx.state.data = {
        title: `${kw} - Bilibili`,
        link: `https://search.bilibili.com/all?keyword=${kw_url}&order=pubdate`,
        description: `Result from ${kw} bilibili search, ordered by pubDate.`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => {
            var l = item.duration
                .split(':')
                .map((i) => [('00' + i).slice(-2)])
                .join(':');
            var des = item.description.replace(/\n/g, '<br/>');
            var img = `<img referrerpolicy="no-referrer" src="${item.pic}">`;
            return {
                title: `${item.title.replace(/<[/ ]?em[^>]*>/g, '')}`,
                description: `Length: ${l}<br/>Auther: ${item.author}    (ID: ${item.mid})<br/>Play: ${item.play}    Favorite: ${item.favorites}<br/>Review: ${item.video_review}    Comment: ${item.review}<br/>Category: ${item.typename}<br/><br/>${des}<br/>${img}<br/>Tag: ${item.tag}<br/>Match By: ${item.hit_columns.join(',')}`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                guid: `${item.id}`,
                link: `${item.arcurl}`,
            };
        }),
    };
};
