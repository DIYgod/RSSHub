const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const homeUrl = 'https://www.ixigua.com';
    const videoApiUrl = `${homeUrl}/api/videov2/author/new_video_list?&to_user_id=${uid}&offset=0&limit=20&order=new`;
    const resp = await got(videoApiUrl, { headers: { referer: homeUrl } });
    const jsonData = resp.data;

    if (jsonData.code !== 200) {
        throw Error(`xigua video API: code = ${jsonData.data.code}, message = ${jsonData.data.message}`);
    }
    if (jsonData.data.videoList.length === 0) {
        throw Error('xigua video API: videoList is empty');
    }

    const videoInfos = jsonData.data.videoList;
    const userInfo = videoInfos[0].user_info;

    ctx.state.data = {
        title: `${userInfo.name} 的西瓜视频`,
        link: `${homeUrl}/home/${uid}`,
        description: userInfo.description,
        item: videoInfos.map((i) => ({
            title: i.title,
            description:
                (disableEmbed ? '' : `<iframe width="720" height="405" frameborder="0" allowfullscreen src="https://www.ixigua.com/iframe/${i.gid}?autoplay=0" referrerpolicy="unsafe-url" allowfullscreen></iframe><br>`) +
                `<img src="${i.middle_image.url}" /><p>${i.abstract}</p>`,
            link: `${homeUrl}/${i.gid}`,
            pubDate: i.publish_time * 1000,
            author: userInfo.name,
        })),
    };
};
