const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const what = ctx.params.what ?? 'rfy';
    const keyword = ctx.params.keyword ?? '';
    const order = ctx.params.order ?? 'most-recent';

    const rootUrl = 'https://www.deviantart.com';
    const currentUrl = `${rootUrl}/_napi/da-browse/api/networkbar/${what}/deviations?${what === 'rfy' ? '' : (what === 'search' ? 'q' : what) + `=${keyword}${order ? `&order=${order}` : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.deviations.map((item) => {
        const description = (type) => {
            switch (type) {
                case 'literature': {
                    return `<p>${item.textContent.excerpt}</p>`;
                }
                case 'image': {
                    const token = item.media.token ? `?token=${item.media.token[0]}` : '';
                    const src = item.media.types.reduce((prev, cur) => (prev.w < cur.w && cur.c ? cur : prev)).c?.replace(/<prettyName>/, item.media.prettyName);
                    return `<img src="${src ? `${item.media.baseUri}/${src}` : item.media.types.filter((type) => type.t === 'gif')[0].b ?? item.media.baseUri}${token}">`;
                }
                case 'film': {
                    const src = item.media.types.reduce((prev, cur) => (prev.w < cur.w && cur.t === 'video' ? cur : prev)).b;
                    const poster = `${item.media.baseUri}/${item.media.types.reduce((prev, cur) => (prev.w < cur.w && cur.c ? cur : prev)).c?.replace(/<prettyName>/, item.media.prettyName) ?? ''}`;
                    return `<video src="${src}" poster="${poster}" controls></video>`;
                }
            }
        };

        return {
            title: item.title,
            link: item.url,
            author: item.author.username,
            pubDate: parseDate(item.publishedTime),
            description: description(item.type),
        };
    });

    ctx.state.data = {
        title: `${keyword ? `${keyword} - ` : ''}DeviantArt`,
        link: `${rootUrl}${what === 'rfy' ? '' : what === 'search' ? `/search?q=${keyword}` : `/${what}/${keyword}?order=${order}`}`,
        item: items,
    };
};
