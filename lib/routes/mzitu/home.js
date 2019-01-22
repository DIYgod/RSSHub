const axios = require('../../utils/axios');
const { getList } = require('./util');

module.exports = async (ctx) => {
    const { type = '' } = ctx.params;
    let url;

    let title = '妹子图';

    if (type === 'hot') {
        title += '-最热';
        url = 'http://adr.meizitu.net/wp-json/wp/v2/hot';
    } else {
        title += '-最新';
        url = 'http://adr.meizitu.net/wp-json/wp/v2/posts?per_page=100';
    }

    const response = await axios({
        method: 'get',
        url,
    });
    const data = response.data;
    ctx.state.data = {
        title: title,
        link: `http://www.mzitu.com/${type}`,
        item: await Promise.all(
            data.map(async (item) => {
                if (type === 'hot') {
                    item.thumb_src = item.thumb_src_min;
                }
                const list = await getList(item.id);
                const listDescription = list.join('');
                return {
                    title: `${item.title} ${list.length} pages`,
                    description: `<img referrerpolicy="no-referrer" src="${item.thumb_src}"><br />${listDescription}`,
                    link: `http://www.mzitu.com/${item.id}`,
                };
            })
        ),
    };
};
