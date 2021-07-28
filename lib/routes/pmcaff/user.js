const got = require('@/utils/got');

// 样例 链接 : https://www.pmcaff.com/user/profile/Oak7mqnEQJ
const baseUrl = 'https://www.pmcaff.com/user/profile/';
const api_url = 'https://api.pmcaff.com/api/v0/user/user-articles/';

const sizeTitle = 'PMCAFF互联网产品社区';

// 参考 feed.js

module.exports = async (ctx) => {
    // 默认 用户 id  Oak7mqnEQJ
    const userid = ctx.params.userid || 'Oak7mqnEQJ';
    const user_article = api_url + userid;

    // 直接获取到 json 数据
    const response = await got({
        method: 'get',
        url: user_article,
        headers: {
            Referer: baseUrl,
        },
    });

    let user_name = '';

    const result = [];
    response.data.data.map(async (item) => {
        const title = item.title;
        const guid = item.article_id;
        const pubDate = new Date(item.ctime).toUTCString();

        const link = item.target_url;
        const description = item.content;

        const single = {
            title: title,
            link: link,
            guid: guid,
            pubDate: pubDate,
            description: description,
        };

        // 更新用户名
        user_name = item.user_profile.name;

        result.push(single);
    });

    ctx.state.data = {
        title: user_name + '---' + sizeTitle,
        link: baseUrl + userid,
        description: 'PMCAFF互联网产品社区 - 产品经理人气组织::专注于互联网产品研究',
        item: result,
    };
};
