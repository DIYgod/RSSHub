const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.itjuzi.com/api/index/invse',
    });

    const data = response.data;

    ctx.state.data = {
        title: 'IT桔子-投融资事件',
        link: 'https://www.itjuzi.com/',
        item: data.map((item) => {
            const invest = item.invst.map((item) => item.name).join('、');

            return {
                title: `${item.name} / ${item.round} / ${item.money}`,
                link: `https://www.itjuzi.com/company/${item.invse_com_id}`,
                description: `
        <img src="${item.logo}"><br><br>
        <strong>${item.name}</strong><br>
        ${item.slogan}<br>
        ${item.round} / ${item.money} / ${item.time}<br>
        投资方: ${invest}
      `,
                pubDate: new Date(item.time).toUTCString(),
                guid: item.id,
            };
        }),
    };
};
