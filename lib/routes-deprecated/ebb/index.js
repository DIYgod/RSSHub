const got = require('@/utils/got');
const lzstring = require('lz-string');
module.exports = async (ctx) => {
    const url = 'https://ebb.io/_/anime_list';
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
        return: 'string',
    });
    const responseData = JSON.parse(lzstring.decompressFromUTF16(response.data));
    const result = responseData.map((item) => ({
        title: item.name_chi,
        link: `https://ebb.io/anime/${item.anime_id}x${item.season_id}`,
        description: `${item.season_title} - ${item.episode_title}`,
        guid: `${item.anime_id}-${item.season_id}-${item.episode_title}`,
    }));
    ctx.state.data = { title: 'ebb.io', link: 'https://ebb.io', description: '最新連載', item: result };
};
