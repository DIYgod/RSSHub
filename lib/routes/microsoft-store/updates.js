const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { market = 'CN', productid } = ctx.params;

    const { data } = await got({
        method: 'get',
        url: `https://displaycatalog.mp.microsoft.com/v7.0/products/${productid}/?fieldsTemplate=&market=${market}&languages=en`,
        headers: {
            'Content-Type': 'application/json',
            'MS-CV': `${Array(16)
                .join(',')
                .split(',')
                .map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.length)))
                .join('')}.1`,
        },
    });

    ctx.state.data = {
        title: `${data.Product.LocalizedProperties[0].ProductTitle} - Microsoft Store Updates`,
        link: `https://www.microsoft.com/store/productId/${productid}`,
        item: [
            {
                title: data.Product.DisplaySkuAvailabilities[0].Sku.Properties.Packages[0].PackageFullName,
                pubDate: new Date(data.Product.DisplaySkuAvailabilities[0].Sku.LastModifiedDate),
                link: `https://www.microsoft.com/store/productId/${productid}`,
            },
        ],
    };
};
