const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { owner, image, tag = 'latest' } = ctx.params;

    const namespace = `${owner}/${image}`;

    const data = await axios.get(`https://hub.docker.com/v2/repositories/${namespace}/buildhistory/?page_size=5`);
    const metadata = await axios.get(`https://hub.docker.com/v2/repositories/${namespace}`);

    const list = data.data.results.filter((a) => a.status === 10 && a.dockertag_name === tag);

    const out = list.map((item) => ({
        title: `${namespace}:${tag} was built successfully`,
        link: `https://hub.docker.com/r/wangqiru/ttrss/builds`,
        author: owner,
        pubDate: item.last_updated,
    }));

    ctx.state.data = {
        title: `Docker image build history: ${namespace}:${tag}`,
        description: metadata.description,
        link: `https://hub.docker.com/r/${namespace}`,
        item: out,
    };
};
