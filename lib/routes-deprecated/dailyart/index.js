const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { body } = await got.post('https://panel.getdailyart.com/APIMobile/artworks/query', {
        headers: {
            Language: ctx.params.language || 'en',
            AuthSalt: 'ZG9jY29tcGFuaW9uc2FsdA==',
        },
        json: {
            take: 10,
            skip: 0,
            local_date: new Date().toISOString().split('T')[0],
        },
        responseType: 'json',
    });

    const data = body.entities;

    ctx.state.data = {
        title: `DailyArt`,
        link: 'https://www.getdailyart.com/',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src='${item.photo_ipad}'><br>
${item.info}<br>
${item.size || ''}<br>
${item.genre && item.genre.name ? item.genre.name : ''}<br>
${item.museum && item.museum.name ? item.museum.name : ''}`,
            pubDate: new Date(item.publish_date).toUTCString(),
            link: item.photo_retina,
        })),
    };
};
