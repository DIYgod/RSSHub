const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await axios({
        method: 'get',
        url: 'https://api.zhihu.com/pins/hot_list?reverse_order=0',
    });

    ctx.state.data = {
        title: '知乎想法热榜',
        description: '整点更新',
        item: data.map(({ target }) => {
            const pubDate = new Date(target.created * 1000).toUTCString();
            const author = target.author.name;
            const title = `${author}：${target.excerpt_title}`;
            const link = `https://www.zhihu.com/pin/${target.id}`;
            const description = target.content.reduce((description, item) => {
                switch (item.type) {
                    case 'text':
                        description += `<div>${item.content}</div>`;
                        break;

                    case 'image':
                        description += `<img referrerpolicy="no-referrer" src="${item.url.replace('_xl.', '_r.').replace('_ms.', '_r.')}" />`;
                        break;

                    case 'video':
                        description += `<video
                    controls="controls"
                    width="${item.playlist.hd.width}"
                    height="${item.playlist.hd.height}"
                    poster="${item.cover_info.thumbnail}"
                    src="${item.playlist.hd.play_url}"
                  >`;
                        break;

                    case 'link':
                        description += `<div><a href="${item.url}">${item.title}</a><br><img referrerpolicy="no-referrer" src="${item.image_url}" /></div>`;
                        break;

                    default:
                        description += '未知类型，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue';
                }

                return description;
            }, `<a href="https://www.zhihu.com${target.author.url}">${author}</a>：`);

            return {
                title,
                description,
                author,
                pubDate,
                link,
            };
        }),
    };
};
