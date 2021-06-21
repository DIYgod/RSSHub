const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://photos.app.goo.gl/${id}?_imcp=1`;

    const response = await got.get(url);

    const real_url = response.request.options.url.href;

    const info = JSON.parse(response.data.match(/AF_initDataCallback.*?data:(\[[\s\S]*\])\s/m)[1]) || [];

    const album_name = info[3][1];
    const owner_name = info[3][5][2];

    const list = info[1];

    ctx.state.data = {
        title: `${owner_name} 创建的 Google 相册 - ${album_name}`,
        link: url,
        item: list.slice(0, 50).map((item) => {
            const time = new Date(item[2] * 1);
            const isVideo = Object.keys(item[15]).length > 2; // uncertain
            const description = isVideo ? `<video src="${item[1][0]}=m18" controls controlslist="nodownload" loop style="max-width: 100%;">` : `<img src="${item[1][0]}=w${item[1][1]}-h${item[1][2]}-no" style="max-width: 100%;">`;
            return {
                title: time.toLocaleString(),
                author: album_name,
                description: description,
                pubDate: time,
                link: real_url.replace('?', `/photo/${item[0]}?`),
                guid: item[0],
            };
        }),
    };
};
