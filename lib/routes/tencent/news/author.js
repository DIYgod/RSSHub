const got = require('@/utils/got');

module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const link = `https://new.qq.com/omn/author/${mid}`;
    const api_url = `https://pacaio.match.qq.com/om/mediaArticles?mid=${mid}&num=15&page=0`;
    const response = await got({
        method: 'get',
        url: api_url,
        headers: { Referer: link },
    });
    const reponse = response.data;
    const title = reponse.mediainfo.name;
    const description = reponse.mediainfo.intro;
    const list = reponse.data;

    const items = list.map((item) => {
        const title = item.title;
        const date = Date(item.timestamp);
        const itemUrl = item.vurl;
        const author = item.source;
        const description = item.abstract;

        const single = {
            title,
            description,
            link: itemUrl,
            author,
            pubDate: date,
        };
        return single;
    });
    ctx.state.data = {
        title: title,
        description: description,
        link: link,
        item: items,
    };
};
