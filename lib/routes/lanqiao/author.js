const got = require('@/utils/got');

async function getUserName(uid) {
    // 获取用户信息
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/users/${uid}/`,
        headers: {
            Referer: `https://www.lanqiao.cn/users/${uid}/`,
        },
    });

    return response.data.name;
}

module.exports = async (ctx) => {
    const uid = ctx.params.id;
    const userName = await getUserName(uid);
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/users/${uid}/courses/?type=published`,
        headers: {
            Referer: `https://www.lanqiao.cn/users/${uid}/`,
        },
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    // 这个对象中包含了数组名为 results，所以 response.data.results 则为需要的数据
    ctx.state.data = {
        // 源标题
        title: `${userName} 发布的课程`,
        // 源链接
        link: `https://www.lanqiao.cn/users/${uid}`,
        // 源说明
        description: `${userName} 发布的课程`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 课程名称
            title: item.name,
            // 课程介绍和封面
            description: `${item.description}<br><img src="${item.picture_url}">`,
            // 课程链接
            link: `https://www.lanqiao.cn/courses/${item.id}`,
        })),
    };
};
