const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://umall.vip.qq.com/v2/?_wv=1025&_wwv=4&product=32482&path=/category/list-ip&query=ip%253D20372%2526type%253Dip%2526isDetail%253D1%2526sortType%253D3#/category/list-ip?ip=20372&type=ip&isDetail=1&sortType=3';
    const response = await got({
        method: 'post',
        url: 'https://uapi.vip.qq.com/Api/api.brand.productssrf',
        json: {
            page: 1,
            per_page: 20,
            asc: 0,
            brand_id: 20372,
            sort_type: 3,
            adtag2: 'search_mr',
            scence: 'ipdetail',
        },
        headers: {
            Referer: link,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });

    ctx.state.data = {
        title: 'Westore',
        link,
        description: '微信周边',
        item: response.data.brands.map(({ name, img, vipprice, id }) => {
            const description = `
        <img src="https:${img}" /><br>
        <strong>价格:</strong> ${+vipprice / 100}元
      `;

            return {
                title: name,
                description: description,
                link: `https://umall.vip.qq.com/v2/?_wv=1025&_wwv=4&product=32482&path=/product/${id}`,
            };
        }),
    };
};
