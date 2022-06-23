const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const sharecode = ctx.params.sharecode;
    const pagesize = ctx.params.pagesize ?? 20;

    const getUserInfo = await got(`https://apiv4.tapechat.net/unuser/userBox/${sharecode}`, {
        headers: {
            Referer: `https://www.tapechat.net/${sharecode}`,
        },
    });

    const nickname = getUserInfo.data.content.nickName;
    const production = getUserInfo.data.content.production;
    const avatar = getUserInfo.data.content.customPic;
    // const description = getUserInfo.data.content.selfDescription;

    const getQuestionFromUser = await got(`https://apiv4.tapechat.net/unuser/getQuestionFromUser/${sharecode}?pageSize=${pagesize}`, {
        headers: {
            Referer: `https://www.tapeask.net/${sharecode}`,
        },
    });

    const data = getQuestionFromUser.data.content.data;

    ctx.state.data = {
        title: `${nickname} 的 Tape 提问箱`,
        link: `https://www.tapechat.net/${sharecode}`,
        image: avatar,
        description: production,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.title}<br>(${item.createdAt})<br><br><b>答：</b><br>${item.answer.txtContent}<br>(${parseDate(item.answerAt, 'X').toLocaleString()})`,
            guid: item.visitCode,
            pubDate: parseDate(item.answerAt, 'X'),
            link: `https://www.tapechat.net/answeredDetail.html?sharecode=${sharecode}&dynamicId=${item.visitCode}`,
        })),
    };
};
