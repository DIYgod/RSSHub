const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://jiuye.swjtu.edu.cn/career/';

module.exports = async (ctx) => {
    const resp = await got({
        method: 'post',
        url: `${rootURL}/zpxx/search/zpxx/1/30`,
    });

    const list = resp.data.data.list;

    const items = await Promise.all(
        list.map((item) => {
            const key = `swjtu:zpxx: ${item.zpxxid}`;
            return ctx.cache.tryGet(key, async () => {
                const data = await got({
                    method: 'post',
                    url: `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`,
                });
                const content = data.data.data;

                // 工作岗位表
                const job_info = [
                    `<div overflow-x="auto" width="20%"> 
                            <table border="1px" table-layout="fixed" width="100%"> 
                            <tr> <th>职位名称</th> 
                                <th>职位月薪</th> 
                                <th>工作地点</th> 
                                <th>专业需求</th> 
                                <th>应聘条件</th> 
                            </tr>`,
                ];
                if (content.zwxxList !== null) {
                    for (const job of content.zwxxList) {
                        job_info.push(`<tr> 
                        <td width="50">${job.zwmc}</td> 
                        <td width="50">${job.yxmc}/月</td> 
                        <td width="50">${job.gzdz}</td> 
                        <td width="70">${job.zyyqmc}</td> 
                        <td width="125">${job.zwms}</td> 
                        </tr>`);
                    }
                }
                job_info.push('</table></div>');

                return {
                    title: `${item.dwmc}（${item.xzyjmc}）`,
                    pubDate: parseDate(String(item.fbrq)),
                    description: `
                <p>招聘主题：${item.zpzt}</p>
                <p>单位名称：${item.dwmc}</p>
                <p>单位性质：${item.xzyjmc}</p>
                <p>行业名称：${item.hyyjmc}（${item.hyejmc}）</p>
                <p>公司规模：${item.rsgmmc}</p>
                <p>招聘职位：</p>
                ${job_info.join('')}
                <p>工作地点：${item.szxmc} ${item.xxdz}</p>
                <p>招聘截止日期：${item.zpjzrq}</p>
                <p>简历投递邮箱：${item.jltdyx}</p>
                <p>单位网站：${item.dwwz}</p>
                ${content.zpxxEditor}
                `,
                    link: `${rootURL}/zpxx/view/zpxx/${item.zpxxid}`,
                };
            });
        })
    );

    ctx.state.data = {
        title: '西南交大-就业招聘信息',
        link: `${rootURL}/zpxx/zpxx`,
        item: items,
        allowEmpty: true,
    };
};
