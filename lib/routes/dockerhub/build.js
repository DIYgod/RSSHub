const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { owner, image, tag = 'latest' } = ctx.params;

    const namespace = `${owner}/${image}`;

    const data = await axios.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/?page_size=5`);
    const metadata = await axios.get(`https://hub.docker.com/v2/repositories/${namespace}`);

    const list = data.data.results.filter((a) => a.name === tag);

    const out = list.map((item) => ({
        title: `${namespace}:${tag} was built. ${(item.images[0].size / 1000000).toFixed(2)} MB`,
        link: `https://hub.docker.com/r/wangqiru/ttrss/`,
        author: owner,
        pubDate: item.last_updated,
    }));

    ctx.state.data = {
        title: `${namespace}:${tag} build history`,
        description: metadata.description,
        link: `https://hub.docker.com/r/${namespace}`,
        item: out,
    };
};
