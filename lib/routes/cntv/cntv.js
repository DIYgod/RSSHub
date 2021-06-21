const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.column;

    const response = await got({
        method: 'get',
        url: `http://api.cntv.cn/lanmu/videolistByColumnId?id=${id}&n=20&of=fdate&p=1&type=0&serviceId=tvcctv`,
    });
    const data = response.data.response.docs;
    const name = data[0].videoTag.split(',')[0] || id;

    ctx.state.data = {
        title: `CNTV 栏目 - ${name}`,
        description: `${name} 栏目的视频更新`,
        item: data.map((item) => ({
            title: item.videoTitle,
            description: `<p>${item.videoBrief}</p><br><p><img src="${item.videoKeyFrameUrl}"></p><br><p>在线观看: <a href="https://www.m3u8play.com/?play=https://hls.cntv.baishancdnx.cn/asp/hls/main/0303000a/3/default/${item.videoSharedCode}/main.m3u8">M3U8在线播放</a></p>`,
            pubDate: new Date(item.videoProductiontime * 1).toUTCString(),
            link: item.videoUrl,
            category: item.videoTag.split(','),
        })),
    };
};
