const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    latest: {
        link: 'article!2',
        title: '最新',
    },
    hot: {
        link: 'article!3',
        title: '热门',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#mei-hua-wang-wen-zhang">docs</a>');
    }

    const currentUrl = `https://www.meihua.info/${cfg.link}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const data = JSON.parse(response.data.match(/"compositionStore":(.*?),"detailStore":/)[1]);

    const shotList = data.compositionsData.list.map((item) => ({
        title: item.title,
        link: `https://www.meihua.info/article/${item.compositionId}`,
        pubDate: new Date(item.gmtPublish).toUTCString(),
    }));

    const items = await Promise.all(
        shotList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const contentResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(contentResponse.data);

                item.description = content('#article-content-html').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${cfg.title}文章 - 梅花网`,
        link: currentUrl,
        item: items,
    };
};
