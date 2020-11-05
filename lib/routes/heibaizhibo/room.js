const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got.get(`https://www.heibaizhibo.com/anchorLive/${id}`);

    const liveInfo = Function('const window={};' + response.data.match(/window\.__NUXT__=.*;/gm)[0] + 'return window.__NUXT__')();

    const item =
        Object.keys(liveInfo.data[0].live_info).length === 0 || liveInfo.data[0].live_info.startDate === ''
            ? []
            : [
                  {
                      title: liveInfo.data[0].text,
                      author: liveInfo.data[0].anchorInfo.nickname,
                      link: response.url,
                  },
              ];

    ctx.state.data = {
        title: `${liveInfo.data[0].anchorInfo.nickname} - 黑白直播`,
        image: liveInfo.data[0].anchorInfo.portrait,
        description: liveInfo.data[0].anchorInfo.notice,
        link: response.url,
        item: item,
        allowEmpty: true,
    };
};
