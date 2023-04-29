const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'http://scc.hnu.edu.cn/';
    // 校园招聘的路由为/module/getcareers，但该页面默认仅加载整体框架，具体的招聘信息在页面加载完成后再交易获取。
    // 具体的交易可以通过f12，网络栏进行查看，项目中仅保留了必须携带的参数。
    // 其中有用的参数为count，为获取招聘信息的数量。
    const currentRoute = `${rootUrl}module/getcareers`;
    const currentUrl = `${currentRoute}?start_page=1&type=inner&day=&count=20&start=1`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const company_list = response.data.data;

    ctx.state.data = {
        title: '校园招聘',
        link: currentRoute,
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
