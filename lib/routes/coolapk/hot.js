const got = require('@/utils/got');
const utils = require('./utils');
const getLinkAndTitle = (type, period) => {
    const baseURL = 'https://api.coolapk.com/v6/page/dataList?url=';
    let link;
    const res = {};
    const types = {
        jrrm: {
            title: '今日热门',
            url: baseURL + '%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1',
        },

        dzb: {
            title: '点赞榜',
            sortField: 'likenum',
        },

        scb: {
            title: '收藏榜',
            sortField: 'favnum',
        },
        plb: {
            title: '评论榜',
            sortField: 'replynum',
        },
        ktb: {
            title: '酷图榜',
            sortField: 'likenum',
        },
    };

    const periods = {
        daily: {
            description: '日榜',
            statType: 'day',
        },
        weekly: {
            description: '周榜',
            statType: '7days',
        },
    };

    if (type === 'jrrm') {
        res.link = types.jrrm.url;
        res.title = types.jrrm.title;
        return res;
    } else if (type === 'ktb') {
        const trans = {
            daily: {
                description: '周榜',
                statDays: '7days',
            },
            weekly: {
                description: '月榜',
                statDays: '30days',
            },
        };
        link = `#/feed/coolPictureList?statDays=` + trans[period].statDays + `&listType=statFavNum&buildCard=1&title=` + trans[period].description + `&page=1`;
        res.title = '酷图榜-' + trans[period].description;
    } else {
        link = `#/feed/statList?statType=` + periods[period].statType + `&sortField=` + types[type].sortField + `&title=` + periods[period].description + `&page=1`;
        res.title = types[type].title + `-` + periods[period].description;
    }
    res.link = baseURL + encodeURIComponent(link);
    return res;
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'jrrm';
    const period = ctx.params.period || 'daily';
    const { link, title } = getLinkAndTitle(type, period);
    const r = await got({
        method: 'get',
        url: link,
        headers: utils.getHeaders(),
    });
    const data = r.data.data;
    const t = [];
    for (const i of data) {
        if (i.entityType === 'card') {
            for (const k of i.entities) {
                t.push(k);
            }
        } else {
            t.push(i);
        }
    }

    let out = await Promise.all(t.map((item) => utils.parseDynamic(item, ctx)));

    out = out.filter((i) => i);

    ctx.state.data = {
        title,
        link: 'https://www.coolapk.com/',
        description: `热榜-` + title,
        item: out,
    };
};
