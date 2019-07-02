const got = require('@/utils/got');
const url = require('url');

const baseUrl = 'http://job.kmust.edu.cn';

module.exports = async (ctx) => {
    const title = '双选会-昆明理工大学就业网';
    const pageUrl = url.resolve(baseUrl, `/module/getjobfairs?start_page=1&keyword=&count=20&start=1&_=${+new Date()}`);
    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: baseUrl,
        },
    });
    const data = response.data || {};

    ctx.state.data = {
        title,
        link: url.resolve(baseUrl, '/module/jobfairs'),
        item:
            data.data &&
            data.data.slice(0, 10).map((item) => {
                const { meet_day = '', meet_time = '', title = '', school_name = '', address = '', fair_id = '' } = item;
                return {
                    title: `【${meet_day} ${meet_time}】${title}`,
                    description: `时间：${meet_day} ${meet_time}<br>地点：${school_name ? `${school_name}-${address}` : address}`,
                    link: url.resolve(baseUrl, `/detail/jobfair?id=${fair_id}`),
                };
            }),
    };
};
