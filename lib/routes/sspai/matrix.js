const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const api_url = 'https://sspai.com/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false';
    const resp = await axios({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;

    ctx.state.data = {
        title: '少数派 -- Matrix',
        link: 'https://sspai.com/matrix',
        description: '少数派 -- Matrix',
        item: data.map((item) => ({
            title: item.title.trim(),
            description: item.summary.trim(),
            link: `https://sspai.com/post/${item.id}`,
            pubDate: new Date(item.released_at * 1000).toUTCString(),
            author: item.author.nickname,
        })),
    };
};
