const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const host = 'https://user.guancha.cn';
    const link = `https://app.guancha.cn/user/get-published-list?page_size=20&page_no=1&uid=${uid}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const list = response.data.data.items;
    const user_nick = list[0].user_nick;
    function getpass_at(e) {
        //修复数据返回缺少年份的情况 但是 几个小时前的就不想写了 = =
        if (e.length === 11) {
            let now = new Date();
            let year = now.getFullYear();
            e = year + "-" + e;
        }
        let time = new Date(e).toLocaleString();
        return time;
    }
    ctx.state.data = {
        title: `${user_nick}-观察者-风闻社区`,
        link: link,
        description: `${user_nick} 的个人主页`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.summary}<br><img src="${item.pic}">`,
            pubDate: getpass_at(item.pass_at),
            link: `https://user.guancha.cn/main/content?id=${item.id}`,
            author: item.user_nick,
        })),
    };
};
