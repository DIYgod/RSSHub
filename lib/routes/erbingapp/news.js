const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://api.diershoubing.com:5001/feed/tag/?pn=0&rn=20&tag_type=0&src=ios`,
    });
    const data = JSON.parse(response.body).feeds;
    const items = data.map((item) => {
        let description = `<p>${item.content}</p>`;
        const acontent = item.acontent.toString();
        const ProcessDesc = (link, type) => {
            if (type) {
                description += `<p><a href="${link}">More</a></p>`;
            } else {
                for (const item of link) {
                    description += `<p><img src="${item}"></p>`;
                }
            }
        };

        if (item.video_img !== null) {
            ProcessDesc([item.video_img]);
        } else if (acontent.indexOf('104129') !== -1) {
            ProcessDesc([item.article.humb.split('?')[0]]);
        } else if (acontent.indexOf('.html') !== -1) {
            ProcessDesc([acontent], 'html');
        } else if (acontent.indexOf('"imgs') !== -1) {
            const imgs = JSON.parse(acontent).imgs.split(',');
            ProcessDesc(imgs);
        } else {
            const imgs = acontent.split(',');
            ProcessDesc(imgs);
        }
        return {
            title: item.title,
            link: item.share.url,
            description,
            pubDate: timezone(parseDate(item.create_time), +8),
        };
    });

    ctx.state.data = {
        title: `二柄APP`,
        link: `https://www.diershoubing.com`,
        description: `二柄APP新闻`,
        item: items,
    };
};
