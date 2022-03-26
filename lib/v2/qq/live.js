const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://live.qq.com';
    const currentUrl = `${rootUrl}/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data.match(/"is_live":(\d),"game_count".*"nickname":"(.*)","child_name".*"show_time":(\d+),"activity".*"room_name":"(.*)","user_chat_level"/);

    const items =
        data[1] === '1'
            ? [
                  {
                      author: data[2],
                      guid: data[3],
                      title: data[4],
                      pubDate: parseDate(data[3] * 1000),
                      link: currentUrl,
                  },
              ]
            : [];

    ctx.state.data = {
        title: `${data[2]}直播间 - 企鹅直播`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
