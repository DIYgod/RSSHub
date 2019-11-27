const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://ourwork-api.nework360.com/needs/listHotJobs?pageNum=1&limit=100`,
    });

    const data = response.data.data;

    const items = data.map((jobDetail) => ({
        title: jobDetail.jobName,
        link: `https://ourwork.nework360.com/project/detail/${jobDetail.needsId}`,
        author: jobDetail.nickname,
        description: jobDetail.description,
        pubDate: new Date(jobDetail.createTime).toUTCString(),
    }));

    ctx.state.data = {
        title: '好队友-远程工作',
        link: 'https://ourwork.nework360.com/job/list',
        item: items,
    };
};
