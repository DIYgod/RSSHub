const { getTeslaPrice } = require('./get-price');

module.exports = async (ctx) => {
    const cars = [
        {
            name: 'Model 3',
            link: 'https://www.dongchedi.com/auto/series/3762',
        },
        {
            name: 'Model Y',
            link: 'https://www.dongchedi.com/auto/series/4363',
        },
        {
            name: 'Model S',
            link: 'https://www.dongchedi.com/auto/series/1254',
        },
        {
            name: 'Model X',
            link: 'https://www.dongchedi.com/auto/series/1255',
        },
    ];

    const promises = cars.map((car) => getTeslaPrice(car.link));
    const prices = await Promise.all(promises);

    ctx.state.data = {
        title: 'Tesla Model 系列价格更新',
        link: 'https://www.tesla.cn/model3/design#overview',
        description: 'Tesla Model 系列价格更新',
        item: prices.map((price, index) => ({
            title: `${cars[index].name} 价格更新为 ${price}`,
            link: `https://www.tesla.cn/${cars[index].name}/design#overview`,
            author: 'Tesla',
            guid: `https://www.tesla.cn/${cars[index].name}/design#overview#${price}`,
        })),
    };
};
