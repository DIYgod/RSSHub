const got = require('@/utils/got');
const { JSDOM } = require('jsdom');

function nuxtReader(data) {
    let nuxt = {};
    try {
        const dom = new JSDOM(data, {
            runScripts: 'dangerously',
            url: 'https://egame.qq.com',
        });
        nuxt = dom.window.__NUXT__;
    } catch (e) {
        throw new Error('Nuxt 框架信息提取失败，请报告这个问题');
    }

    return nuxt;
}

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://egame.qq.com/${id}`;
    const response = await got({
        method: 'get',
        url,
    });

    const result = await nuxtReader(response.data);
    const liveInfo = result.state['live-info'].liveInfo;
    const item =
        liveInfo.profileInfo.isLive !== 1
            ? []
            : [
                  {
                      title: liveInfo.videoInfo.title,
                      author: liveInfo.profileInfo.nickName,
                      description: liveInfo.videoInfo.url ? `<img src="${liveInfo.videoInfo.url}">` : '',
                      pubDate: new Date(liveInfo.videoInfo.pid.split('_').slice(-1) * 1000),
                      url,
                      guid: liveInfo.videoInfo.pid,
                  },
              ];

    ctx.state.data = {
        title: `${liveInfo.profileInfo.nickName} - 企鹅电竞`,
        image: liveInfo.profileInfo.posterUrl,
        description: liveInfo.profileInfo.brief,
        link: url,
        item,
        allowEmpty: true,
    };
};
