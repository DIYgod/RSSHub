const axios = require('../../utils/axios');
const qs = require('querystring');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'http://music.163.com/api/dj/program/byradio',
        headers: {
            Referer: 'https://music.163.com/',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            radioId: id,
            limit: 1000,
            offset: 0,
        }),
    });

    const programs = response.data.programs || [];

    const { radio, dj } = programs[0] || { radio: {}, dj: {} };

    ctx.state.data = {
        title: radio.name,
        link: `https://music.163.com/djradio?id=${id}`,
        subtitle: radio.desc,
        description: radio.desc,
        author: dj.nickname,
        updated: radio.lastProgramCreateTime,
        icon: radio.picUrl,
        item: programs.map((pg) => {
            const image = `<img src=${pg.coverUrl} />`;

            const description = `<div>${(pg.description || '')
                .split('\n')
                .map((p) => `<p>${p}</p>`)
                .join('')}</div>`;

            const src = `https://music.163.com/program/${pg.id}`;

            const duration = ~~(pg.duration / 1000);

            const html = image + description + `<div><p>时长: ${(duration / 60).toFixed(0).padStart(2, '0')}:${(duration % 60).toFixed(0).padStart(2, '0')}</p><p><a href="${src}">查看节目</a></p></div>`;

            return {
                title: pg.mainSong.name,
                link: src,
                pubDate: new Date(pg.createTime).toUTCString(),
                published: new Date(pg.createTime).toISOString(),
                author: pg.dj.nickname,
                description: html,
                content: { html },
            };
        }),
    };
};
