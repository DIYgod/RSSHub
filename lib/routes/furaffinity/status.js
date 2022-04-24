const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/status.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const data = response.data;
    const status = data.online;

    let description = '';
    if (Object.keys(data)[0] === 'online') {
        description = `Status: ${Object.keys(data)[0]} <br> Guests: ${status.guests} <br>Registered: ${status.registered} <br> Other: ${status.other}  <br>Total: ${status.total} <br> Fa Server Time: ${data.fa_server_time}`;
    } else {
        description = 'offline';
    }
    const item = [];
    item.push({
        title: `Status:${Object.keys(data)[0]}`,
        description,
        link: `https://www.furaffinity.net/`,
    });

    ctx.state.data = {
        // 源标题
        title: `Fur Affinity Status`,
        // 源链接
        link: `https://www.furaffinity.net/`,
        // 源说明
        description: `Fur Affinity Status`,

        item,
    };
};
