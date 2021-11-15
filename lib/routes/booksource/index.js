import got from '~/utils/got.js';

const api = 'http://api.booksource.store/repo/list?sort=update_time&page=1&size=10';
export default async (ctx) => {
    const {
        data
    } = await got.get(api);
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
            <p>${item.rank || item.account ? '其它:' : ''} ${item.rank ? '排行榜' : ''} ${item.account ? '网站账号登录' : ''}</p>`,
        })),
    };
};
