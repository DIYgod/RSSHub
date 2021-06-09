const got = require('@/utils/got');

module.exports = async (ctx) => {
    const result = [];
    const response = await got({
        method: 'get',
        url: 'https://monster-siren.hypergryph.com/api/albums',
    });

    const albums = response.data.data;

    /* for (const i in albums) {
    let res = await got({
      method: 'get',
      url: `https://monster-siren.hypergryph.com/api/album/${albums[i].cid}/detail`,
    });
    albums[i] = res.data.data;
    const songs = res.data.data.songs;
     for (const j in songs) {
      res = await got({
        method: 'get',
        url: `https://monster-siren.hypergryph.com/api/song/${songs[j].cid}`,
      });
      result[result.length] = {
        title: songs[j].name,
        description: `<p><small>此音乐所属专辑：${albums[i].name}</small></p><p>${albums[i].intro.replace(/\n/g, '<br />')}</p>`,
        link: `https://monster-siren.hypergryph.com/music/${songs[j].cid}`,
        itunes_item_image: albums[i].coverUrl,
        enclosure_url: res.data.data.sourceUrl,
        enclosure_type: 'audio/mpeg',
      };
     }
    } */
    for (const i in albums) {
        result[i] = {
            title: albums[i].name,
            description: `<p><img src='${albums[i].coverUrl}' /></p>`,
        };
    }

    ctx.state.data = {
        title: '塞壬唱片（《明日方舟》OST）最新音乐',
        link: 'https://monster-siren.hypergryph.com',
        description: '塞壬唱片（《明日方舟》OST）最新音乐。',
        item: result,
    };

    /* ctx.state.data = {
    title: '塞壬唱片（《明日方舟》OST）最新音乐',
    link: 'https://monster-siren.hypergryph.com',
    description: '塞壬唱片（《明日方舟》OST）最新音乐。',
    itunes_author: '塞壬唱片',
    image: albums[0].coverUrl,
    language: 'zh-cn',
    item: result,
  };*/
};
