const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'post',
        url: 'http://music.163.com/api/dj/program/byradio',
        headers: {
            Referer: 'https://music.163.com/',
        },
        form: {
            radioId: id,
            limit: 1000,
            offset: 0,
        },
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
        image: radio.picUrl,
        itunes_author: dj.nickname,
        itunes_category: radio.category,
        item: programs.map((pg) => {
            const image = `<img src=${pg.coverUrl} />`;

            const description = `<div>${(pg.description || '')
                .split('\n')
                .map((p) => `<p>${p}</p>`)
                .join('')}</div>`;

            const src = `https://music.163.com/program/${pg.id}`;

            const duration = ~~(pg.duration / 1000);
            const itunes_duration = `${(duration / 60).toFixed(0).padStart(2, '0')}:${(duration % 60).toFixed(0).padStart(2, '0')}`;

            const html =
                image + description + `<div><audio src="http://music.163.com/song/media/outer/url?id=${pg.mainTrackId}.mp3" controls="controls"></audio><p>时长: ${itunes_duration}</p><p><a href="${src}">查看节目</a></p></div>`;

            return {
                title: pg.name,
                link: src,
                pubDate: new Date(pg.createTime).toUTCString(),
                published: new Date(pg.createTime).toISOString(),
                author: pg.dj.nickname,
                description: html,
                content: { html },
                itunes_item_image: pg.coverUrl,
                enclosure_url: `http://music.163.com/song/media/outer/url?id=${pg.mainTrackId}.mp3`,
                enclosure_length: duration,
                enclosure_type: 'audio/mpeg',
                itunes_duration,
            };
        }),
    };
};
