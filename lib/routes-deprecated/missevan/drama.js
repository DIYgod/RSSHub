const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const host = 'www.missevan.com';
    const dramaUrl = `https://${host}/dramaapi/getdrama?drama_id=${id}`;
    const dramaResp = await got(dramaUrl);

    const items = await Promise.all(
        dramaResp.data.info.episodes.episode.map((item) =>
            ctx.cache.tryGet(`https://www.missevan.com/sound/getsound?soundid=${item.sound_id}`, async () => {
                const soundResponse = await got({
                    method: 'get',
                    url: `https://www.missevan.com/sound/getsound?soundid=${item.sound_id}`,
                });
                const soundData = soundResponse.data.info.sound;
                return {
                    title: item.name,
                    enclosure_url: soundData.soundurl,
                    itunes_duration: Math.trunc(soundData.duration / 1000),
                    enclosure_type: 'audio/mpeg',
                    image: dramaResp.data.info.drama.cover,
                    itunes_author: soundData.username,
                    itunes_category: '',
                    link: `https://www.missevan.com/sound/player?id=${item.sound_id}`,
                    description: `<img src=${dramaResp.data.info.drama.cover}><br>${soundData.intro}`,
                    pubDate: new Date(soundData.last_update_time * 1000).toUTCString(),
                };
            })
        )
    );

    ctx.state.data = {
        title: dramaResp.data.info.drama.name,
        link: `https://${host}/mdrama/drama/${id}`,
        image: dramaResp.data.info.drama.cover,
        description: dramaResp.data.info.drama.abstract,
        item: items,
    };
};
