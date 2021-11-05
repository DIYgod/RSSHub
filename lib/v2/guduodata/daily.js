const got = require('@/utils/got');
const moment = require('moment');

const host = 'http://data.guduodata.com';

const types = {
    collect: {
        name: '汇总榜',
        categories: {
            drama: '连续剧',
            variety: '综艺'
        }
    },
    bill: {
        name: '排行榜',
        categories: {
            network_drama: '网络剧',
            network_movie: '网络大电影',
            network_variety: '网络综艺',
            tv_drama: '电视剧',
            tv_variety: '电视综艺',
            anime: '国漫'
        }
    }
};

module.exports = async (ctx) => {
    const now = moment().valueOf();
    // yestoday
    const yestoday = moment().add(-1, 'days').format('YYYY-MM-DD');
    const items = Object.keys(types).flatMap((key) =>
        Object.keys(types[key].categories).map((category) => ({
            type: key,
            name: `[${yestoday}] ${types[key].name} - ${types[key].categories[category]}`,
            category: category.toUpperCase(),
            url: `${host}/show/datalist?type=DAILY&category=${category.toUpperCase()}&date=${yestoday}`
        }))
    );

    ctx.state.data = {
        title: `骨朵数据 - 日榜`,
        link: host,
        description: yestoday,
        item: await Promise.all(
            items.map((item) => ctx.cache.tryGet(item.url,
                async () => {
                    const response = await got.get(`${item.url}&t=${now}`, {
                        headers: { Referer: `http://data.guduodata.com/`, },
                    });
                    const data = response.data.data;
                    const rows = data.map((currValue, currIndex) => `<tr>
                        <td width="20">${currIndex + 1}</td>
                        <td>${currValue.name}</td>
                        <td>${currValue.platforms}</td>
                        <td>${currValue.release_date}</td>
                        <td>${currValue.comment || ''}</td>
                        <td>${currValue.baidu_index || ''}</td>
                        <td>${currValue.douban || ''}</td>
                        <td>${currValue.gdi}</td>
                    </tr>`)
                    .reduce((total, curr) => total + curr);
                    return {
                        title: item.name,
                        pubDate: yestoday,
                        link: item.url,
                        description: `<table>
                            <thead>
                                <th>排名</th>
                                <th>剧名</th>
                                <th>播放平台</th>
                                <th>上映时间</th>
                                <th>评论数</th>
                                <th>百度指数</th>
                                <th>豆瓣评分</th>
                                <th>全网热度</th>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>`,
                    };
                })
            )
        )
    };
};