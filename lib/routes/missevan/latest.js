const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://www.missevan.com/dramaapi/filter?filters=0_0_0_0_0&page=1&order=1&page_size=20`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const items = await Promise.all(
        response.data.info.Datas.map(async (item) => {
            const dramaUrl = `https://www.missevan.com/dramaapi/getdrama?drama_id=${item.id}`;
            const dramaResponse = await got({
                method: 'get',
                url: dramaUrl,
            });
            try {
                const soundUrl = `https://www.missevan.com/sound/getsound?soundid=${dramaResponse.data.info.episodes.episode[0].sound_id}`;
                const soundResponse = await got({
                    method: 'get',
                    url: soundUrl,
                });
                const soundData = soundResponse.data.info.sound;
                return {
                    title: item.name + (item.integrity === 3 ? '（已完结）' : '（更新至 ' + item.newest + '）'),
                    enclosure_url: soundData.soundurl,
                    itunes_duration: ~~(soundData.duration / 1000),
                    enclosure_type: 'audio/mpeg',
                    image: item.cover,
                    itunes_author: soundData.username,
                    itunes_category: '',
                    link: `https://www.missevan.com/sound/player?id=${dramaResponse.data.info.episodes.episode[0].sound_id}`,
                    description: `<img src=${item.cover}><br>${soundData.intro}`,
                    pubDate: new Date(soundData.last_update_time * 1000).toUTCString(),
                };
            } catch (err) {
                return Promise.resolve('');
            }
        })
    );

    ctx.state.data = {
        title: `猫耳FM - 最新广播剧`,
        link: `https://www.missevan.com/mdrama`,
        item: items,
    };
};
