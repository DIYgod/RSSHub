const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'http://scc.hnu.edu.cn/';
    const currentUrl = `${rootUrl}module/getcareers?start_page=1&type=inner&day=&count=20&start=1`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const company_list = response.data.data;

    ctx.state.data = {
        title:`湖南大学 校内招聘`,
        link: currentUrl,
        item:
            company_list.map((company_info) => {
                const ret = {
                    title:company_info.company_name,
                    link:`${rootUrl}detail/career?id=${company_info.career_talk_id}`,
                    description:company_info.address + company_info.meet_time,
                    category:company_info.company_property
                };
                return ret;
        })
    };
};
