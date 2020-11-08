const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got.get(`https://www.heibaizhibo.com/anchorLive/${id}`);

    const liveInfo = Function('const window={};' + response.data.match(/window\.__NUXT__=.*;/gm)[0] + 'return window.__NUXT__')();
    const gtvId = liveInfo.data[0].gtvId;
    const res = await got.get(`https://sig.heibaizhibo.com/signal-front/live/matchLiveInfo?gtvId=${gtvId}&source=2&liveType=3&defi=hd`);
    const offline = res.data.data[0].score === -1;

    const item = offline
        ? []
        : [
              {
                  title: liveInfo.data[0].text,
                  author: liveInfo.data[0].anchorInfo.nickname,
                  link: response.url,
                  guid: response.url + liveInfo.data[0].live_info.startDate,
              },
          ];

    ctx.state.data = {
        title: `${liveInfo.data[0].anchorInfo.nickname} - 黑白直播`,
        image: liveInfo.data[0].anchorInfo.portrait,
        description: liveInfo.data[0].anchorInfo.notice,
        link: response.url,
        item,
        allowEmpty: true,
    };
};
