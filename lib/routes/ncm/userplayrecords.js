const got = require('@/utils/got');
const config = require('@/config').value;

const headers = {
    cookie: config.ncm.cookies,
    Referer: 'https://music.163.com/',
};

function getItem(records) {
    if (!records || records.length === 0) {
        return [
            {
                title: '暂无听歌排行',
            },
        ];
    }

    return records.map((record, index) => {
        const song = record.song;
        const album = song.al ? `<img src=${song.al.picUrl} />` : '';

        const artists = song.ar.map((a) => `<a href="https://music.163.com/artist?id=${a.id}">${a.name}</a>`).join(`/`);

        const artists_paintext = song.ar.map((a) => a.name).join('/');

        const html = `<div>
            排行：${index + 1} 播放次数：${record.playCount} 得分：${record.score}<br>
            歌曲：<a href="http://music.163.com/song?id=${song.id}">${song.name}</a><br>
            歌手：${artists}<br>
            歌曲图：${album}<br>
        </div>`;

        return {
            title: `[${index + 1}] ${song.name} - ${artists_paintext}`,
            link: `http://music.163.com/song?id=${song.id}`,
            author: artists_paintext,
            description: html,
        };
    });
}

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const type = parseInt(ctx.params.type) || 0;

    const url = `http://music.163.com/api/v1/play/record?uid=${uid}&type=${type}`;
    const response = await got({ url, headers });

    const records = type === 1 ? response.data.weekData : response.data.allData;

    ctx.state.data = {
        title: type === 1 ? `听歌榜单（最近一周）- ${uid}` : `听歌榜单（所有时间）- ${uid}`,
        link: `http://music.163.com/user/home?id=${uid}`,
        updated: response.headers.date,
        item: getItem(records),
    };
};
