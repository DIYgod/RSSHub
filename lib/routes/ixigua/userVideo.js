const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const homeUrl = 'https://www.ixigua.com';
    const videoApiUrl = `${homeUrl}/api/videov2/author/video?&author_id=${uid}&type=video&max_time=0`;
    const resp = await got(videoApiUrl, { headers: { referer: homeUrl } });
    const jsonData = resp.data;

    if (jsonData.code !== 200) {
        throw Error(`xigua video API: code = ${jsonData.code}, message = ${jsonData.data.message}`);
    }
    if (jsonData.data.data.length === 0) {
        throw Error('xigua video API: data is empty');
    }

    const videoInfos = jsonData.data.data;
    const userInfo = videoInfos[0].user_info;

    ctx.state.data = {
        title: `${userInfo.name} 的西瓜视频`,
        link: `${homeUrl}/home/${uid}`,
        description: userInfo.author_desc,
        item: videoInfos.map((i) => ({
            title: i.title,
            description:
                (disableEmbed ? '' : `<iframe width="720" height="405" frameborder="0" allowfullscreen src="https://www.ixigua.com/iframe/${i.gid}?autoplay=0&startTime=0"></iframe><br>`) +
                `<img src="${i.middle_image.url}" /><p>${i.abstract}</p>`,
            link: `${homeUrl}/${i.gid}`,
            pubDate: i.publish_time * 1000,
            author: userInfo.name,
        })),
    };
};
