const got = require('@/utils/got');
const map = new Map([
    ['1', { code: '%E5%8F%91%E7%8E%B0', name: '发现' }],
    ['2', { code: '%E5%BE%85%E5%9B%9E%E7%AD%94', name: '待回答' }],
    ['3', { code: '%E6%9C%80%E7%83%AD', name: '最热' }],
    ['4', { code: '%E9%97%AE%E7%AD%94%E4%B8%93%E5%9C%BA', name: '问答专场' }],
    ['5', { code: '%E6%8A%95%E7%A8%BF', name: '投稿' }],
    ['6', { code: '%E6%B7%B1%E5%BA%A6', name: '深度' }],
    ['7', { code: '%E4%B8%93%E6%A0%8F', name: '专栏' }],
]);

module.exports = async (ctx) => {
    const typeid = ctx.params.typeid || '1';
    const type_code = map.get(typeid).code;
    const type_name = map.get(typeid).name;
    const response = await got({
        method: 'get',
        url: `https://api.pmcaff.com/api/v0/communities/feed?page=1&column=${type_code}`,
    });

    const result = [];
    response.data.data.map(async (item) => {
        const title = item.title;
        const guid = item.id;
        const pubDate = new Date(item.ctime).toUTCString();

        let link = '';
        let description = '';
        if (item.entity_type === 'question') {
            link = `https://www.pmcaff.com/discuss/index/${guid}/?newwindow=1`;
            description = item.content;
        } else if (item.entity_type === 'article') {
            link = `https://www.pmcaff.com/article/index/${guid}/?newwindow=1`;
            description = item.content;
        } else {
            link = 'https://www.pmcaff.com/feed/';
            description = '不支持的类型';
        }

        const single = {
            title: title,
            link: link,
            guid: guid,
            pubDate: pubDate,
            description: description,
        };

        result.push(single);
    });
    ctx.state.data = { title: `${type_name} - PMCAFF互联网产品社区`, link: 'https://www.pmcaff.com/feed/', description: `PMCAFF互联网产品社区 - 产品经理人气组织::专注于互联网产品研究`, item: result };
};
