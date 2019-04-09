const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const APIUrl = `https://download.fir.im/${id}`;

    const webUrl = `https://fir.im/${id}`;

    const res = await axios({
        method: 'get',
        url: APIUrl,
        headers: {
            Referer: webUrl,
        },
    });

    const data = res.data;

    const title = data.app.name + ' 更新';

    const item = {};
    item.title = data.app.name + ' ' + data.app.releases.master.version + '(' + data.app.releases.master.build + ')';
    item.description = data.app.releases.master.changelog;
    item.link = `https://fir.im/x9zu?release_id=${data.app.releases.master.id}`;
    item.pubDate = new Date(data.app.releases.master.created_at * 1000).toUTCString();
    ctx.state.data = {
        title: title,
        link: webUrl,
        item: [item],
    };
};
