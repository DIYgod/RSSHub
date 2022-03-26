module.exports = {
    generateData: (data) =>
        data.map((item) => {
            const target = item.target ? item.target : item;
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
                        description += `<img src="${item.url.replace(/_.+\.jpg/g, '.jpg')}" />`;
                        break;

                    case 'video':
                        try {
                            description += `<video
                        controls="controls"
                        width="${item.playlist.hd.width}"
                        height="${item.playlist.hd.height}"
                        poster="${item.cover_info.thumbnail}"
                        src="${item.playlist.hd.play_url}"
                      >`;
                        } catch (e) {
                            description += `<video
                            controls="controls"
                            width="${item.playlist.pop().width}"
                            height="${item.playlist.pop().height}"
                            poster="${item.thumbnail}"
                            src="${item.playlist.pop().play_url}"
                          >`;
                        }
                        break;

                    case 'link':
                        description += `<div><a href="${item.url}">${item.title}</a><br><img src="${item.image_url}" /></div>`;
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
