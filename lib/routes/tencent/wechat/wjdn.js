const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    if (!id) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#wei-xin-gong-zhong-hao-wai-jie-da-nao-lai-yuan">docs</a>');
    }

    const currentUrl = `https://www.waijiedanao.com/api/posts?profile=${id}&page=1&limit=20`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const title = response.data.data[0].profile.title;
    const list = response.data.data.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.digest,
        pubDate: new Date(item.publishAt).toUTCString(),
    }));

    ctx.state.data = {
        title: `微信公众号 - ${title}`,
        link: `https://www.waijiedanao.com/accountArtical?publicAccountId=${id}`,
        item: list,
    };
};
