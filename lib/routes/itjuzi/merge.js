const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.itjuzi.com/api/index/merge',
    });

    const data = response.data.data;

    ctx.state.data = {
        title: 'IT桔子-并购事件',
        link: 'https://www.itjuzi.com/',
        item: data.map((item) => {
            const party = item.party.map((item) => item.name || item.invst_name).join('、');

            return {
                title: `${item.name}-${item.slogan}`,
                link: `https://www.itjuzi.com/merger/${item.id}`,
                description: `
        <img src="${item.logo}"><br><br>
        <strong>${item.name}</strong><br>
        ${item.slogan}<br>
        股权占比: ${item.ratio} / 金额: ${item.money} / ${item.time}<br>
        并购方: ${party}
      `,
                pubDate: new Date(item.time).toUTCString(),
                guid: item.id,
            };
        }),
    };
};
