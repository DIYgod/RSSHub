const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { type = 'all' } = ctx.params;
    const map = {
        all: '',
        tech: '121288001',
        agriculture: '123330001,125672021',
        acg: '122018001',
        design: '121292001,126176002,126202001',
        love: '121280001',
        tele: '121284001',
        music: '121278001',
        book: '121274002',
        game: '122020001',
        other: '125706031,125888001,125886001,123332001',
    };
    const url = `https://izhongchou.taobao.com/dream/ajax/getProjectList.htm?page=1&pageSize=20&projectType=${encodeURIComponent(map[type])}&type=6&status=&sort=1&_ksTS=${Date.now()}_104&callback=`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const items = response.data.data.map((item) => {
        const title = item.name;
        const link = `https://izhongchou.taobao.com/dreamdetail.htm?id=${item.id}`;
        const description = `
      <img src="https:${item.image}"><br><br>
      <strong>达成率:</strong> ${item.finish_per}%<br>
      <strong>已筹金额:</strong> ${item.curr_money}元<br>
      <strong>支持人数:</strong> ${item.buy_amount}<br>
    `;

        return {
            title,
            link,
            description,
            guid: item.id,
        };
    });

    ctx.state.data = {
        title: `淘宝众筹-${type}`,
        link: 'https://izhongchou.taobao.com/index.htm',
        item: items,
    };
};
