const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const full_url = utils.base_url + '/v6/page/dataList?url=%23%2Ffeed%2FdigestList%3Ftype%3D12%26is_html_article%3D1%26recommend%3D3&title=%E5%9B%BE%E6%96%87&page=1';
    const response = await got({
        method: 'get',
        url: full_url,
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    const out = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const pubdate = new Date(item.dateline * 1000).toUTCString();
            const itemUrl = item.shareUrl;
            const author = item.username;

            const description = await ctx.cache.tryGet(itemUrl, async () => {
                const result = await got({
                    method: 'get',
                    url: itemUrl.split('?')[0],
                    headers: utils.getHeaders(),
                });

                const raw = JSON.parse(result.data.data.message_raw_output);
                const tags = raw.map((i) => {
                    if (i.type === 'text') {
                        return `<p>${i.message}</p>`;
                    } else if (i.type === 'image') {
                        return `<p class="img-container" style="text-align:center">
                            <img src="${i.url}"><br>
                            <span class="image-caption">${i.description}</span></p>`;
                    } else {
                        return i;
                    }
                });

                return tags.join('');
            });

            const single = {
                title: title,
                description: description,
                pubDate: pubdate,
                link: itemUrl,
                author: author,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `酷安图文`,
        link: full_url,
        description: `酷安 - 编辑精选 - 图文`,
        item: out,
    };
};
