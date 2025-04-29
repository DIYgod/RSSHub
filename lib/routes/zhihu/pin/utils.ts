import { parseDate } from '@/utils/parse-date';

const generateDescription = (target, description = '') => {
    for (const item of target.content) {
        switch (item.type) {
            case 'text':
                description += `<div>${item.content}</div>`;
                break;

            case 'image':
                description += `<img src="${item.url.replaceAll(/_.+\.jpg/g, '.jpg')}" />`;
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
                } catch {
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
    }
    return description;
};

const generateData = (data) =>
    data.map((item) => {
        const target = item.target ?? item;
        const pubDate = parseDate(target.created * 1000);
        const author = target.author.name;
        const title = `${author}：${target.excerpt_title}`;
        const link = `https://www.zhihu.com/pin/${target.id}`;
        let description = generateDescription(target, `<a href="https://www.zhihu.com${target.author.url}">${author}</a>：`);
        if (target.origin_pin !== undefined) {
            const t = target.origin_pin;
            const origin_link = `<a href="https://www.zhihu.com/pin/${t.id}">转发原文</a>：`;
            const origin_description = generateDescription(t, `<a href="https://www.zhihu.com${t.author.url}">${t.author.name}</a>：`);
            description = `${description} ${origin_link} ${origin_description}`;
        }
        return {
            title,
            description,
            author,
            pubDate,
            link,
        };
    });

export { generateData };
