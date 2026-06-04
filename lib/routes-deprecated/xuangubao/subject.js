const got = require('@/utils/got');

module.exports = async (ctx) => {
    const subject_id = ctx.params.subject_id;

    const response = await got({
        method: 'get',
        url: `https://api.xuangubao.cn/api/pc/subj/${subject_id}?limit=20`,
        headers: {
            Referer: `https://xuangubao.cn/subject/${subject_id}`,
        },
    });

    const subject = response.data.Subject;
    const subject_title = subject.Title;
    const subject_desc = subject.Desc;

    const messages = response.data.Messages;

    const out = messages.map((item) => {
        const date = item.CreatedAt;
        const link = item.Url;
        const title = item.Title;
        const description = item.Summary;

        const single = {
            title,
            link,
            pubDate: date,
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `${subject_title} - 主题 - 选股宝`,
        link: `https://xuangubao.cn/subject/${subject_id}`,
        description: subject_desc,
        item: out,
    };
};
