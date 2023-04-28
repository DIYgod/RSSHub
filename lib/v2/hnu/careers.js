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
        title: `湖南大学 校内招聘`,
        link: currentUrl,
        item: company_list.map((company_info) => {
            const ret = {
                // 标题：公司名称
                title: company_info.company_name,
                // 链接：公司招聘简章链接
                link: `${rootUrl}detail/career?id=${company_info.career_talk_id}`,
                // 描述：校招教室+时间+专业
                description: company_info.address + ' - ' + company_info.meet_time + ' - ' + company_info.professionals,
                // 分类：公司类型（私营、国企）+ 工作城市
                category: company_info.company_property + ' - ' + company_info.city_name,
            };
            return ret;
        }),
    };
};
