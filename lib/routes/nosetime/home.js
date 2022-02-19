const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://www.nosetime.com/perfume.php`;

    const response = await got({
        method: 'GET',
        url: 'https://www.nosetime.com/app/smart.php?page=1&type=discovery',
        headers: {
            Referer: link,
        },
    });

    const items = response.data.items.map((item) => ({
        title: `${'★★★★★☆☆☆☆☆'.slice(5 - item.uwscore, 10 - item.uwscore)} ${item.ifullname}`,
        description: item.udcontent,
        pubDate: new Date(item.uface * 1000).toUTCString(),
        link: `https://www.nosetime.com/xiangshui/${item.iid}-${item.iurl}.html`,
        author: item.uname,
    }));

    ctx.state.data = {
        title: `香水时代`,
        link,
        description: '最新香水评论|发现香水圈的新鲜事 - 香水时代NoseTime.com',
        item: items,
    };
};
