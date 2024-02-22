const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const link = `https://www.missevan.com/sound/m/46?order=0`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('.fc-leftcontent-block>div.fc-hoverheight-container')
        .map((_, item) => {
            item = $(item);
            const id = $('a', item).attr('href').match(/\d+/)[0];
            return {
                title: item.find('a').attr('title'),
                id,
            };
        })
        .get();
    ctx.state.data = {
        title: '猫耳FM - 最新有声漫画',
        link: 'https://www.missevan.com/sound/m/46',
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(`https://www.missevan.com/sound/getsound?soundid=${item.id}`, async () => {
                    const res = await got({ method: 'get', url: `https://www.missevan.com/sound/getsound?soundid=${item.id}` });
                    const soundData = res.data.info.sound;
                    return {
                        title: item.title,
                        enclosure_url: soundData.soundurl,
                        itunes_duration: Math.trunc(soundData.duration / 1000),
                        enclosure_type: 'audio/mpeg',
                        image: item.cover,
                        itunes_author: soundData.username,
                        itunes_category: '',
                        link: `https://www.missevan.com/sound/player?id=${item.id}`,
                        description: `<img src=${item.cover}><br>${soundData.intro}`,
                        pubDate: new Date(soundData.last_update_time * 1000).toUTCString(),
                    };
                })
            )
        ),
    };
};
