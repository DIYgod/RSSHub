const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.wangqiutiyu.com';
    const currentUrl = `${rootUrl}/anchor/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data;
    const author = data.match(/userNickName:"(.*)",userPic/)[1];
    const matchStartTime = data.match(/matchStartTime:(.*),matchState/)[1];

    const items =
        matchStartTime.length === 10
            ? [
                  {
                      author,
                      link: currentUrl,
                      pubDate: parseDate(matchStartTime * 1000),
                      title: data.match(/barTitle:"(.*)",displayType/)[1],
                      guid: data.match(/sourceId:"(\d+)"},matchId/)[1] + matchStartTime,
                  },
              ]
            : [];

    ctx.state.data = {
        title: `${author}直播间 - 旺球体育`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        description: data.match(/barIntroduction:"(.*)",barNo/)[1],
    };
};
