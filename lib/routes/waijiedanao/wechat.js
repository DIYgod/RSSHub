const got = require('@/utils/got');

module.exports = async (ctx) => {
    const cfg = ctx.params.id;
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#wai-jie-da-nao-wen-zhang">docs</a>');
    }

    const currentUrl = `https://www.waijiedanao.com/api/posts?profile=${cfg}&page=1&limit=20`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.digest,
        pubDate: new Date(item.publishAt).toUTCString(),
    }));

    ctx.state.data = {
        title: `外接大脑 - ${cfg.title}`,
        link: 'https://www.waijiedanao.com/',
        item: list,
    };
};
