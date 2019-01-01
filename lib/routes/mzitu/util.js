const axios = require('../../utils/axios');

exports.getList = async (id) => {
    const contentUrl = `http://adr.meizitu.net/wp-json/wp/v2/i?id=${id}`;
    const contentResponse = await axios({
        method: 'get',
        url: contentUrl,
    });
    const content = contentResponse.data.content.split(',');
    return content.map((url) => {
        url = url.replace(/"/g, '');
        return `<img referrerpolicy="no-referrer" src="${url}"><br />`;
    });
};
