const got = require('@/utils/got');

module.exports = async (ctx) => {
    let days = ctx.params.days || 1;
    if (days > 7) {
        days = 7;
    } else if (days < 1) {
        days = 1;
    }
    let img_type = ctx.params.img_type || 'original';

    switch (img_type) {
        case 'original':
            img_type = 'picture4';
            break;
        case 'medium':
            img_type = 'picture2';
            break;
        case 'thumbnail':
            img_type = 'picture3';
            break;
        case 'poster':
            img_type = 'fenxiang_img';
            break;
        default:
            img_type = 'picture4';
    }

    const request = [];
    for (let x = 0; x < days; x++) {
        const today = new Date();
        const todayTo = new Date(
            new Date(today.setDate(today.getDate() - x)).toLocaleString('en-US', {
                timeZone: 'Asia/Shanghai',
            })
        );
        const date = `${todayTo.getFullYear()}-${String(todayTo.getMonth() + 1).padStart(2, '0')}-${String(todayTo.getDate()).padStart(2, '0')}`;

        const link = `http://open.iciba.com/dsapi/?date=${date}`;

        request.push(
            ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);
                return result.data;
            })
        );
    }

    const data = await Promise.all(request);

    ctx.state.data = {
        title: `金山词霸每日一句`,
        link: `http://news.iciba.com/`,
        itunes_author: `金山词霸每日一句`, // 主播名字, 必须填充本字段才会被视为播客
        itunes_category: `Learn English`, // 播客分类
        image: data[0].picture3, // `http://cdn.iciba.com/www/img/www/0312/ciba-icon.png`
        item: data.map((item) => ({
            // 文章标题
            title: item.content,
            // 文章正文
            description: `${item.content}<br>${item.note}<br><img src="${item[img_type]}">`,
            // 文章发布时间
            pubDate: new Date(new Date(item.dateline) - 8 * 60 * 60 * 1000),
            // 文章链接
            link: `http://news.iciba.com/views/dailysentence/daily.html#!/detail/title/${item.dateline}`,
            itunes_item_image: item.picture3, // 每个track单独的图片
            enclosure_url: item.tts, // 音频链接
            enclosure_type: `audio/mpeg`,
        })),
    };
};
