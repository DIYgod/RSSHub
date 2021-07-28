const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type !== 'hot' ? 'publish' : 'hot';

    const search_page_url = `https://www.ptpress.com.cn/shopping/search?tag=search&orderStr=${type}`;

    const response = await got({
        method: 'post',
        url: 'https://www.ptpress.com.cn/bookinfo/getBookListForEBTag',
        headers: {
            Referer: search_page_url,
        },
        form: {
            page: 1,
            rows: 18,
            orderStr: type,
        },
    });

    const list = response.data.data.data;

    ctx.state.data = {
        title: `最${type === 'hot' ? '热' : '新'}图书 - 人民邮电出版社`,
        link: search_page_url,
        item: list.map((item) => ({
            title: `${item.bookName} / ￥${item.discountPrice}`,
            author: item.author,
            description: `<img src="${item.picPath}">`,
            pubDate: new Date(item.stockInDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
            link: `https://www.ptpress.com.cn/shopping/buy?bookId=${item.bookId}`,
        })),
    };
};
