const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const userId = ctx.params.userId;
    const pageSize = ctx.params.pageSize ?? 20;
    const token = config.tapechat.token;
    const getUserInfo = await got(`https://apiv4.tapechat.net/unuser/user/${userId}`, {
        headers: {
            Referer: `https://www.tapechat.net/profileMb.html?user=${userId}`,
        },
    });
    const nickname = getUserInfo.data.content.nickName;
    const avatar = getUserInfo.data.content.customPic;
    const description = getUserInfo.data.content.selfDescription;
    const getDynamicFromUser = await got(`https://apiv4.tapechat.net/dynamic/userdynamic/${userId}?pageSize=${pageSize}`, {
        headers: {
            Referer: `https://www.tapechat.net/profileMb.html?user=${userId}`,
            Authorization: token,
        },
    });
    const data = getDynamicFromUser.data.content.data;

    ctx.state.data = {
        title: `${nickname} 的 Tape 动态`,
        link: `https://www.tapechat.net/profileMb.html?user=${userId}`,
        description,
        image: avatar,
        item: data.map((item) => {
            const images = [];
            if (item.item.hasOwnProperty('imgList')) {
                for (let i = 0; i < item.item.imgList.length; i++) {
                    const v = JSON.stringify(item.item.imgList[i]);
                    const x = v.substring(10);
                    images.push(`<img src="${x}">`);
                }
            }
            return {
                title: item.item.txtContent,
                description: art(path.join(__dirname, 'templates/dynamic.art'), {
                    txtContent: item.item.txtContent,
                    images: images.join(''),
                }),
                guid: item.item.mid,
                pubDate: parseDate(item.item.createdTime * 1000),
                link: `https://www.tapechat.net/dynamic.html?dynamicId=${item.item.visitCode}`,
            };
        }),
    };
};
