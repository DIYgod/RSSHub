const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const urlPrefix = 'https://jijinbaapi.eastmoney.com/gubaapi/v3/read';

    const userProfileUrl = `${urlPrefix}/User/UserInfo.ashx?ServerVersion=1.0.0&PhoneType=windows&Location=zh-CN&ctoken=&utoken=&deviceid=000000&ps=8&plat=Wap&product=Fund&version=201&followuid=`;
    const userProfileResponse = await got(`${userProfileUrl}${uid}`);
    const username = userProfileResponse.data.user_nickname || '不存在的用户';

    const userPostListUrl = `${urlPrefix}/Article/Post/UserPostList.ashx`;

    const listResponse = await got({
        method: 'post',
        url: userPostListUrl,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            uid,
            deviceId: 666666,
            version: 201,
            p: 1,
            ps: 20,
        },
    });

    const data = listResponse.data.re;

    const userArticleUrl = `${urlPrefix}/Article/Post/ArticleContent.ashx`;

    const result = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(userArticleUrl + item.post_id, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: userArticleUrl,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `postid=${item.post_id}&ServerVersion=1.0.0&PhoneType=windows&Location=zh-CN&ctoken=&utoken=&deviceId=000000&userId=&plat=Wap&product=Fund&version=201`,
                });
                const description = detailResponse.data.post.post_content;
                const single = {
                    title: item.post_title,
                    description,
                    pubDate: timezone(parseDate(item.post_display_time, 'YYYY-MM-DD HH:mm:ss'), +8),
                    link: `https://fundbarmob.eastmoney.com/index.html?goPage=articleView&lastPage=personDetailView&aid=${item.post_id}`,
                };
                return single;
            })
        )
    );
    ctx.state.data = {
        title: `天天基金-${username}的主页`,
        link: `https://fundbarmob.eastmoney.com/index.html?goPage=personDetailView&userid=${uid}`,
        description: `${username} 的动态`,
        item: result,
    };
};
