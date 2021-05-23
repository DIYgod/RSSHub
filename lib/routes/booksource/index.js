const got = require('@/utils/got');

const api = 'http://api.booksource.store/repo/list?sort=update_time&page=1&size=10';
module.exports = async (ctx) => {
    const response = await got.get(api);
    const data = response.data;
    ctx.state.data = {
        title: `BOOKSOURCE.STORE`,
        link: 'http://booksource.store/',
        description: `BOOKSOURCE.STORE RSS`,
        item: data.map((item) => ({
            title: `${item.name} - v${item.version}`,
            link: `http://${item.url}`,
            author: item.owner,
            pubDate: item.update_time,
            description: `<p>网址: ${item.url}</p>
            <p>作者: ${item.owner}</p>
            <p>更新时间: ${item.update_time}</p>
            <p>${item.rank || item.account ? '其它:' : ''} ${item.rank === true ? '排行榜' : ''} ${item.account === true ? '网站账号登录' : ''}</p>`,
        })),
    };
};
