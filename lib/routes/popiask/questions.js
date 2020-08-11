const got = require('@/utils/got');

module.exports = async (ctx) => {
    const sharecode = ctx.params.sharecode;
    const pagesize = ctx.params.pagesize || 20;

    const getUserInfo = await got({
        method: 'get',
        url: `https://apiv3.popiask.cn/unuser/user/${sharecode}`,
        headers: {
            Referer: `https://www.popiask.cn/${sharecode}`,
        },
    });

    const nickname = getUserInfo.data.content.nickName;
    const production = getUserInfo.data.content.production;
    const description = getUserInfo.data.content.selfDescription;

    const getQuestionFromUser = await got({
        method: 'get',
        url: `https://apiv3.popiask.cn/unuser/getQuestionFromUser/${sharecode}?pageSize=${pagesize}`,
        headers: {
            Referer: `https://www.popiask.cn/${sharecode}`,
        },
    });

    const data = getQuestionFromUser.data.content.data;

    ctx.state.data = {
        title: `${nickname} 的 popiask 提问箱`,
        link: `https://www.popiask.cn/${sharecode}`,
        description: `${production} ${description}`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.title}<br>(${item.created_at})<br><br><b>答：</b><br>${item.answer.txt_content}<br>(${new Date(item.answer_at * 1000).toLocaleString()})`,
            guid: item.answer_at,
            pubDate: new Date(item.answer_at * 1000).toUTCString(),
            link: `https://www.popiask.cn/answered.html?sharecode=${sharecode}&dynamicId=${item.visit_code}`,
        })),
    };
};
