const got = require('@/utils/got');

module.exports = async (ctx) => {
    const city = ctx.params.city || 'sh';
    const keyword = ctx.params.keyword || '';
    const iswhole = ctx.params.iswhole || '0';
    const room = ctx.params.room || '1';
    const domain = `${city === 'bj' ? '' : city + '.'}m.ziroom.com`;

    const response = await got({
        method: 'post',
        url: `http://${domain}/list/ajax-get-data`,
        headers: {
            Referer: `http://${domain}/${city.toUpperCase()}/search.html`,
        },
        form: {
            recent_money: 0,
            sort: 0,
            is_whole: iswhole,
            room,
            key_word: keyword,
            step: 0,
        },
    });
    let data = response.data.data; // 当查询的结果不存在时,该 data 是个对象 { info: '数据加载完毕' }
    // 判断数据的类型,如果有数据就是数组类型的,没有数据的话，就赋值为空数组
    data =
        data instanceof Array
            ? data
            : [
                  {
                      title: '我们找不到任何与您的搜索条件匹配的结果，但是调整您的搜索条件可能会有所帮助',
                      room_name: '',
                      list_img: '',
                      city: '',
                      id: '',
                  },
              ];

    ctx.state.data = {
        title: `自如的${keyword}${iswhole !== '0' ? '整租' : '合租'}${room}室房源`,
        link: `http://${domain}`,
        description: `自如的${keyword}${iswhole !== '0' ? '整租' : '合租'}${room}室房源`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.room_name}<img src="${item.list_img}">`,
            link: `http://${domain}/${city.toUpperCase()}/room/${item.id}.html`,
        })),
    };
};
