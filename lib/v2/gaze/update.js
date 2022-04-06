const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');


// 站长提供的API
const rootUrl = 'https://gaze.run/3e47b75000b0924b6c9ba5759a7cf15d';


module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const response = await got.post(rootUrl, {form: {mid}});
    const data = response.data.data;

    ctx.state.data = {
        title: `gaze.run影视更新通知 - ${data.name}`,
        link: `https://gaze.run/play/${mid}`,
        item: [{
            title: `${data.name}-第${data.episodes}集`,
            description: art(path.resolve(__dirname, './templates/update.art'), { data }),
            link: `https://gaze.run/play/${mid}`,
            pubDate: data.update_time,
        }],
    };
};
