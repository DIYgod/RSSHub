const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://ourwork-api.nework360.com/job/getHotJobList?pageNum=1&limit=100`,
    });

    const data = response.data.data;

    const items = data.map((jobDetail) => ({
        title: jobDetail.title,
        link: `https://www.nework360.com/job/detail/${jobDetail.jobId}`,
        author: jobDetail.publisherId,
        description: jobDetail.description,
        pubDate: new Date(jobDetail.createTime).toUTCString(),
    }));

    ctx.state.data = {
        title: '好队友-远程工作',
        link: 'https://www.nework360.com/job/hots',
        item: items,
    };
};
