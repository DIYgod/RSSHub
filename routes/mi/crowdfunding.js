const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const baseUrl = 'https://home.mi.com/app/shop/content?id=s8939d03918810635';
    const response = await axios({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data.match(/,gid:(\d*),src:"(.+?)"/g).map((item) => ({
        gid: item.match(/gid:(\d*)/)[1],
        img: item.match(/src:"(.+?)"/)[1],
    }));

    const out = await Promise.all(
        data.map(async (item) => {
            const key = `microwdfunding${item.gid}`;
            const value = await ctx.cache.get(key);
            let result;
            if (value) {
                result = JSON.parse(value);
            } else {
                const response = await axios({
                    method: 'get',
                    url: `https://home.mi.com/app/shop/jsonp?k=test&m=Product&a=GetDetail&p={%22gid%22:${item.gid}}&_=${+new Date()}&callback=Zepto1532846359142`,
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const data = JSON.parse(response.data.match(/^Zepto1532846359142\((.*)\);$/)[1]).data || {};
                result = {
                    title: data.goods.name,
                    description: `${data.goods.summary}<br>${data.goods.price_min / 100}元<br><img referrerpolicy="no-referrer" src="${item.img}">`,
                    pubDate: new Date(data.crowdfunding.start * 1000).toUTCString(),
                    link: `https://youpin.mi.com/detail?gid=${item.gid}`,
                };
                ctx.cache.set(key, JSON.stringify(result), 12 * 60 * 60);
            }
            return Promise.resolve(result);
        })
    );

    ctx.state.data = {
        title: '小米众筹',
        link: baseUrl,
        item: out,
    };
};
