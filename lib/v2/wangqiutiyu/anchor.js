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

    const apiResponse = await got({
        method: 'get',
        url: `https://api.ikangsports.com:442/signal-front/live/matchLiveInfo?userId=0&gtvId=${response.data.match(/gtvId:(\d+),heat/)[1]}&source=0&liveType=0`,
    });

    const data = apiResponse.data.data[0];

    const items =
        data.state === 2
            ? [
                  {
                      title: response.data.match(/barTitle:"(.*)",displayType/)[1],
                      author: data.name,
                      link: currentUrl,
                      guid: data.pushTime,
                      pubDate: parseDate(data.pushTime),
                  },
              ]
            : [];

    ctx.state.data = {
        title: `${data.name}直播间 - 旺球体育`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        description: response.data.match(/barIntroduction:"(.*)",barNo/)[1],
    };
};
