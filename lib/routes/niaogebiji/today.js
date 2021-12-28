const got = require('@/utils/got');
module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://www.niaogebiji.com/pc/bulletin/index',
        form: {
            page: 1,
            pub_time: '',
            isfromajax: 1,
        },
    });
    const data = response.data.return_data;
    ctx.state.data = {
        title: '鸟哥笔记-今日事',
        link: 'https://www.niaogebiji.com/pc/bulletin/index',
        item: data
            ? data.map((item) => ({
                  title: item.title,
                  description: item.content + `</br><a href="${item.link}">原文链接</a>`,
                  link: `https://www.niaogebiji.com/pc/bulletin/detail?id=${item.id}`,
                  pubDate: new Date(parseInt(data[0].pub_time + '000')),
              }))
            : [
                  {
                      title: '获取失败！',
                  },
              ],
    };
};
