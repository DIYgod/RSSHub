const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const itemData = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/squarePosts/list',
        headers: {
            'User-Agent': config.ua,
            Referer: `https://m.okjike.com/topics/${id}`,
            'App-Version': '4.1.0',
        },
        data: {
            loadMoreKey: null,
            topicId: id,
            limit: 20,
        },
    });
    const itemInfo = itemData.data.data;

    ctx.state.data = {
        title: `${itemInfo[0].topic.content} - 即刻主题广场`,
        link: `https://web.okjike.com/topic/${id}/user`,
        description: itemInfo[0].topic.content,
        image: itemInfo[0].topic.squarePicture.thumbnailUrl,
        item: itemInfo.map((item) => {
            const user = '用户：' + item.user.screenName;
            const contentTemplate = `<br> ${item.content}`;
            let imgTemplate = '';
            item.pictures.length > 0 &&
                item.pictures.forEach((item) => {
                    imgTemplate += `<br><img referrerpolicy="no-referrer" src="${item.middlePicUrl}">`;
                });

            const videoTemplate = '';
            // 暂时没找到有视频的信息，后续遇到再补充
            // if (item.video) {
            //     videoTemplate = `<br>视频: <img referrerpolicy="no-referrer" src="${item.video.image.picUrl}">`;
            // }
            // if (item.personalUpdate && item.personalUpdate.video) {
            //     videoTemplate = `<br>视频: <img referrerpolicy="no-referrer" src="${item.personalUpdate.video.image.picUrl}">`;
            // }
            return {
                title: item.content,
                description: `${user}${contentTemplate}${imgTemplate}${videoTemplate}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `https://web.okjike.com/post-detail/${item.id}/originalPost`,
            };
        }),
    };
};
