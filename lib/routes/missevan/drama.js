const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const host = 'www.missevan.com';
    const dramaUrl = `https://${host}/dramaapi/getdrama?drama_id=${id}`;
    const dramaResp = await got(dramaUrl);
    const episodesSize = dramaResp.data.info.episodes.episode.length;
    const episodesUrl = `https://${host}/dramaapi/getdramaepisodedetails?drama_id=${id}&p=1&page_size=${episodesSize}`;
    const episodesResp = await got(episodesUrl);

    ctx.state.data = {
        title: dramaResp.data.info.drama.name,
        link: `https://${host}/mdrama/drama/${id}`,
        image: dramaResp.data.info.drama.cover,
        description: dramaResp.data.info.drama.abstract,
        item: episodesResp.data.info.Datas.map((e) => ({
            title: e.soundstr,
            description: `<img src="${e.front_cover}" /><br>${e.intro}`,
            link: `https://${host}/sound/player?id=${e.id}`,
        })),
    };
};
