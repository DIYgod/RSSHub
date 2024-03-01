const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    recommend: {
        link: 'shots!1!0!0!0!0',
        title: '推荐',
    },
    latest: {
        link: 'shots!2!0!0!0!0',
        title: '最新',
    },
    hot: {
        link: 'shots!3!0!0!0!0',
        title: '热门',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/new-media#mei-hua-wang-zuo-pin">docs</a>');
    }

    const currentUrl = `https://www.meihua.info/${cfg.link}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const data = JSON.parse(response.data.match(/"shotsStore":(.*?),"commentStore":/)[1]);

    const shotList = data.shotsData.list.map((item) => ({
        title: item.title,
        link: `https://www.meihua.info/shots/${item.compositionId}`,
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

                item.description = content('div.summary').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${cfg.title}作品 - 梅花网`,
        link: currentUrl,
        item: items,
    };
};
