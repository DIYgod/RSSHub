const axios = require('axios');

module.exports = async (ctx) => {
    const groupid = ctx.params.groupid;

    const response = await axios({
        method: 'get',
        url: `https://api.douban.com/v2/group/${groupid}/topics?start=0&count=10`,
    });

    const topics = response.data.topics;

    // 替换图片到内容中
    topics.map((topic) => {
        const { photos = [] } = topic;
        let { content } = topic;

        content = content.replace(/ /g, '<br>');
        topic.content = content.replace(/<图片(\d*)>/g, function() {
            try {
                const photo = photos.filter((p) => p.seq_id === arguments[1]);

                if (photo.length > 0) {
                    const src = photo[0].alt;
                    return `<img referrerpolicy="no-referrer" src='${src}'/><br>`;
                } else {
                    return '';
                }
            } catch (ex) {
                return '';
            }
        });
        return topic;
    });

    ctx.state.data = {
        title: `豆瓣小组-${groupid}`,
        link: `https://www.douban.com/group/${groupid}/`,
        item: topics.map((topic) => ({
            title: `${topic.title}  [来自: ${topic.author.name}]`,
            author: topic.author.name,
            pubDate: new Date(topic.updated).toUTCString(),
            description: topic.content,
            link: topic.share_url,
        })),
    };
};
