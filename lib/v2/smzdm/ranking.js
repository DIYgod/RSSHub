const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

const getTrueHour = (rank_type, rank_id, hour) => {
    const rank_two_hour = ['11', '17', '28', '29'];
    const rank_four_hour = ['12', '13', '14', '15', '17', '74', '75', '71', '25'];
    const flag = ['pinlei', 'dianshang'].includes(rank_type) && [...rank_two_hour, ...rank_four_hour].includes(rank_id) && hour === '3';
    if (flag) {
        return rank_two_hour.includes(rank_id) ? '2' : '4';
    } else {
        return hour;
    }
};

module.exports = async (ctx) => {
    const { rank_type, rank_id, hour } = ctx.params;

    // When the hour is 3, some special rank_id require a special hour num
    const true_hour = getTrueHour(rank_type, rank_id, hour);

    const response = await got(`https://www.smzdm.com/top/json_more`, {
        headers: {
            Referer: 'https://www.smzdm.com/top/',
        },
        searchParams: {
            rank_type,
            rank_id,
            hour: true_hour,
        },
    });

    const data = response.data.data.list;
    const list1 = [];
    const list2 = [];
    for (let i = 0; i < Math.min(6, data.length); i++) {
        if (data[i][0].length !== 0) {
            list1.push(data[i][0]);
        }
        if (data[i][1].length !== 0) {
            list2.push(data[i][1]);
        }
    }
    const list = [...list1, ...list2];

    ctx.state.data = {
        title: `${rank_type}榜-${rank_id}-${hour}小时`,
        link: 'https://www.smzdm.com/top/',
        allowEmpty: true,
        item: list.map((item) => ({
            title: `${item.article_title} - ${item.article_price}`,
            description: `${item.article_title} - ${item.article_price}<br><img src="${item.article_pic}">`,
            pubDate: timezone(item.article_pubdate, +8),
            link: item.article_url,
        })),
    };
};
