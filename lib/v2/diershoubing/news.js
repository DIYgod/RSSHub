const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const renderDesc = (data) => art(path.join(__dirname, 'templates/news.art'), data);

module.exports = async (ctx) => {
    const { data } = await got(`https://api.diershoubing.com:5001/feed/tag/?pn=0&rn=${ctx.query.limit ? Number(ctx.query.limit) : 20}&tag_type=0&src=ios`);

    const items = data.feeds.map((item) => {
        let acontent;
        let type;
        if (item.video_img && item.video_type === 'bilibili') {
            acontent = { img: item.video_img, bvid: item.video_url.replace('https://www.bilibili.com/video/', '').replace('/', '') };
            type = 'bilibili';
        } else if (item.acontent.startsWith('{')) {
            const contentData = JSON.parse(item.acontent);
            if (contentData.imgs) {
                acontent = contentData.imgs.split(',');
                type = 'imgs';
            } else {
                acontent = { img: contentData.video.split('|')[0], bvid: contentData.video.split('|')[1].replace('https://www.bilibili.com/video/', '') };
                type = 'bilibili';
            }
        } else {
            acontent = item.acontent.split(',');
            type = 'imgs';
        }

        return {
            title: item.title,
            link: item.share.url,
            description: renderDesc({
                description: item.content.replace(/\r\n/g, '<br>'),
                type,
                acontent,
            }),
            category: item.feed_type,
            author: item.create_nick_name,
            pubDate: parseDate(item.create_time),
        };
    });

    ctx.state.data = {
        title: `二柄APP`,
        link: `https://www.diershoubing.com`,
        description: `二柄APP新闻`,
        item: items,
    };
};
