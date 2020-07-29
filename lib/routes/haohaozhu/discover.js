const got = require('@/utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword && ctx.params.keyword !== 'all' && ctx.params.keyword !== '全部' ? ctx.params.keyword : '';

    const url = 'https://www.haohaozhu.cn/community/discover';

    const response = await got({
        method: 'post',
        url: 'https://www.haohaozhu.cn/f/y/api/Share/AllPhotoInPc',
        headers: {
            Referer: url,
        },
        form: {
            keyword: keyword,
            page: 1,
            time: new Date().getTime(),
        },
    });

    const list = response.data.data.rows;

    ctx.state.data = {
        title: `好好住 - 发现${keyword ? ' - ' + keyword : ''}`,
        link: url,
        item: list
            .map((item) => {
                if (item.is_advertisement !== 0 || !item.photo || !item.photo.photo_info) {
                    return '';
                }
                return {
                    title: item.photo.photo_info.remark,
                    author: item.photo.user_info.nick,
                    description: item.photo.photo_info.image_list.map((image) => `<img src="${image.ori_pic_url}" style="max-width: 100%;" />`).join(''),
                    link: url,
                    guid: item.photo.photo_info.id,
                    pubDate: new Date(item.photo.photo_info.addtime * 1000),
                };
            })
            .filter((item) => item !== ''),
    };
};
