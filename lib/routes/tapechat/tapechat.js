const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {
    const userId = ctx.params.userId;
    const pageSize = ctx.params.pageSize || 20;
    


    const getUserInfo = await got({
        method: 'get',
        url: `https://apiv4.tapechat.net/unuser/user/${userId}`,
        headers: {
            Referer: `https://www.tapechat.net/profileMb.html?user=${userId}`,
            //Authorization:`Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGl2NC50YXBlY2hhdC5uZXRcL2F1dGhcL3Bob25lTG9naW4iLCJpYXQiOjE2NDk3NzE1NTIsImV4cCI6NDc3MTgzNTU1MiwibmJmIjoxNjQ5NzcxNTUyLCJqdGkiOiI2dGRKWE4wSU5iYU42NUhRIiwic3ViIjo2Mjg4OTAyLCJwcnYiOiI4N2UwYWYxZWY5ZmQxNTgxMmZkZWM5NzE1M2ExNGUwYjA0NzU0NmFhIn0.dEJXIlvQwPyysijxHsfElashZotL44B078JKeNfWf14`,
        },
    });
    const nickname = getUserInfo.data.content.nickName;
    const avatar = getUserInfo.data.content.customPic;
    


    const description = getUserInfo.data.content.selfDescription;

    const getDynamicFromUser = await got({
        method:'get',
        url:`https://apiv4.tapechat.net/dynamic/userdynamic/${userId}?pageSize=${pageSize}`,
        headers:{
            Referer: `https://www.tapechat.net/profileMb.html?user=${userId}`,
            Authorization:`Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGl2NC50YXBlY2hhdC5uZXRcL2F1dGhcL3Bob25lTG9naW4iLCJpYXQiOjE2NDk3NzE1NTIsImV4cCI6NDc3MTgzNTU1MiwibmJmIjoxNjQ5NzcxNTUyLCJqdGkiOiI2dGRKWE4wSU5iYU42NUhRIiwic3ViIjo2Mjg4OTAyLCJwcnYiOiI4N2UwYWYxZWY5ZmQxNTgxMmZkZWM5NzE1M2ExNGUwYjA0NzU0NmFhIn0.dEJXIlvQwPyysijxHsfElashZotL44B078JKeNfWf14`,
        },

    });
    const data = getDynamicFromUser.data.content.data;
    ctx.state.data = {
        title: `${nickname} 的 Tape 动态`,
        link: `https://www.tapechat.net/profileMb.html?user=${userId}`,
        description:`${description}`,
        image: avatar,
        item: data.map((item) => {
            var images =[]
            if ((item.item.hasOwnProperty('imgList'))){
                for (let i = 0; i < item.item.imgList.length; i++) {
                    const v = JSON.stringify(item.item.imgList[i]);
                    const x = v.substring(10);
                    images.push(`<img src=${x}>`);
                    
                }
            }
            return {
            title:'',
            description: `<meta name="referrer" content="no-referrer">${item.item.txtContent}<br>${images.join('')}`,
            guid:item.item.mid,
            pubDate: parseDate(item.item.createdTime * 1000),
            //
            link: `https://www.tapechat.net/dynamic.html?dynamicId=${item.item.visitCode}`,
            }
        }),
    };
};
