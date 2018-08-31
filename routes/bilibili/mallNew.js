const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://mall.bilibili.com/mall-c/home/calendar/list?page=new&startWeekNO=0&limitWeekSize=3',
        headers: {
            Referer: 'https://mall.bilibili.com/date.html?page=new',
        },
    });

    const data = response.data.data.vo.weeks;
    const days = [...data[0].days, ...data[1].days];
    const items = [];
    days.forEach((day) => {
        items.push(...day.presaleItems);
    });

    ctx.state.data = {
        title: '会员购新品上架',
        link: 'https://mall.bilibili.com/date.html?page=new',
        item: items.map((item) => ({
            title: item.name,
            description: `${item.name}<br>${item.priceDesc ? `${item.pricePrefix}${item.priceSymbol}${item.priceDesc[0]}` : ''}<br><img referrerpolicy="no-referrer" src="https:${item.img}"><br><a href="${
                item.itemUrl
            }">APP 内打开</a>`,
            link: item.itemUrlForH5,
        })),
    };
};
