const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}/live/${id}`;
    const apiUrl = `${rootUrl}/live/api/liveblog/${id}`;
    const imageRootUrl = 'https://dkjm35kkdt2ag.cloudfront.net';

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.blogArticleList.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30).map((item) => ({
        link: `${rootUrl}/live/api/liveblog/article?articleId=${item}&model=main`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const data = detailResponse.data.data;

                item.title = data.title;
                item.pubDate = parseDate(data.updatedDate);
                item.description = art(path.join(__dirname, 'templates/live.art'), {
                    images: data.content.filter((d) => d.type === 'img').map((i) => `${imageRootUrl}/${i.imgFileUrl}`),
                    texts: data.content.filter((d) => d.type === 'text').map((t) => t.content),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `公視新聞網 PNN - ${response.data.data.title.replace(/【不斷更新】/, '')}`,
        link: currentUrl,
        item: items,
    };
};
