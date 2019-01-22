const axios = require('../../../../utils/axios');
const url = require('url');

const baseUrl = 'http://job.kmust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type || 'inner';
    const title = `${type === 'inner' ? '校内宣讲会' : '校外宣讲会'}-昆明理工大学就业网`;
    const pageUrl = url.resolve(baseUrl, `/module/getcareers?start_page=1&keyword=&type=${type}&day=&count=20&start=1&_=${+new Date()}`);
    const response = await axios({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: baseUrl,
        },
    });
    const data = response.data || {};

    ctx.state.data = {
        title,
        link: url.resolve(baseUrl, `/module/careers${type === 'outer' && '?type=outer'}`),
        item:
            data.data &&
            data.data.map((item) => {
                const { meet_day = '', meet_time = '', company_name = '', school_name = '', address = '', company_property = '', industry_category = '', career_talk_id = '' } = item;
                return {
                    title: `【${meet_day} ${meet_time}】${company_name}`,
                    description: `时间：${meet_day} ${meet_time}<br>地点：${school_name ? `${school_name}-${address}` : address}<br>类别：${company_property}<br>行业类别：${industry_category}`,
                    link: url.resolve(baseUrl, `/detail/career?id=${career_talk_id}`),
                };
            }),
    };
};
