const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const keyword = ctx.params.keyword;
    const city_api_url = `https://fe-api.zhaopin.com/c/i/city-page/user-city?ipCity=${encodeURI(city)}`;

    const city_response = await got({
        method: 'get',
        url: city_api_url,
    });
    const city_response_data = city_response.data.data;
    if (city_response_data.name) {
        const job_api_url = `https://fe-api.zhaopin.com/c/i/sou?pageSize=20&cityId=${city_response_data.code}&workExperience=-1&education=5&companyType=-1&employmentType=-1&jobWelfareTag=-1&kw=${encodeURI(keyword)}&kt=3`;
        const job_response = await got({
            method: 'get',
            url: job_api_url,
        });

        // ## 获取列表
        const list = job_response.data.data.results;
        // ## 定义输出的item
        const out = await Promise.all(
            // ### 遍历列表，筛选出自己想要的内容
            list.map(async (item) => {
                const jobName = item.jobName;
                const companyName = item.company.name;
                const companyType = item.company.type.name;
                const companySize = item.company.size.name;
                const companyUrl = item.company.url;
                const companyLogo = item.companyLogo; // logo
                const salary = item.salary;
                const jobType = item.jobType.items[0].name;
                const positionURL = item.positionURL; // 原网页链接
                const updateDate = item.updateDate; // 更新时间

                // 获取详情页面的介绍
                const detail_response = await got({
                    method: 'get',
                    url: positionURL,
                });
                const $ = cheerio.load(detail_response.data);
                const detail_content = $('.describtion').html();
                // # 拼接相关信息
                // ## 拼接标题
                const title = `${jobName}[${salary}]-${jobType}`;
                // ## 公司信息
                const companyDes = `<h3>${companyName}</h3><h4>${companyType}[${companySize}]</h4><a href='${companyUrl}'>点击查看公司详情</a><br/><img url='${companyLogo}'</img>`;
                const cache_information = positionURL + updateDate; // 确保唯一性
                const cache = await ctx.cache.get(cache_information); // ### 得到全局中的缓存信息
                // ### 判断缓存是否存在，如果存在即跳过此次获取的信息
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                // ### 设置 RSS feed item
                const single = {
                    title,
                    link: positionURL,
                    // author,
                    description: `<a href='${positionURL}'>如需申请此工作，建议打开原网页进行操作。</a><br/><hr/>${companyDes}<br/><hr/>${detail_content !== null ? detail_content : ''}`,
                    pubDate: updateDate,
                };
                // // ### 设置缓存
                ctx.cache.set(cache_information, JSON.stringify(single));
                return Promise.resolve(single);
                // }
            })
        );

        ctx.state.data = {
            title: `${city}-${keyword} 相关工作 - 智联招聘`,
            link: `https://sou.zhaopin.com/?jl=${city_response_data.code}&sf=0&st=0&el=5&kw=${encodeURI(keyword)}&kt=3`,
            description: `${city} 的 ${keyword} 相关工作 - 智联招聘`,
            item: out,
        };
    }
};
