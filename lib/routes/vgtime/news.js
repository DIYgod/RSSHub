const axios = require('../../utils/axios');
const qs = require('qs');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `http://www.vgtime.com/vgtime-app/api/v2/homepage/listByTag.json?page=1&pageSize=20&tags=1`,
    });
    const data = response.data.data.topicList;

    const result = await Promise.all(
        data.map(async (item) => {
            const article = await axios({
                method: 'post',
                url: `http://app02.vgtime.com:8080/vgtime-app/api/v2/post/detail.json`,
                data: qs.stringify({
                    appId: '1bc2a63f60f64ff0bd0815f78933b940',
                    sign: '9487759916449709f429e2609ddc940e7e3d4a49',
                    type: 1,
                    page: 1,
                    postId: item.postId,
                }),
            });

            return Promise.resolve({
                title: item.title,
                description: article.data.data.postDetail.content,
                pubDate: new Date(item.publishDate * 1000).toUTCString(),
                link: item.shareUrl,
            });
        })
    );

    ctx.state.data = {
        title: `游戏时光新闻列表`,
        link: `http://www.vgtime.com/topic/index.jhtml`,
        item: result,
    };
};
