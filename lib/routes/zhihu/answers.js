const axios = require('@/utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/members/${id}/answers?include=data%5B*%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Cmark_infos%2Ccreated_time%2Cupdated_time%2Creview_info%2Cquestion%2Cexcerpt%2Crelationship.is_authorized%2Cvoting%2Cis_author%2Cis_thanked%2Cis_nothelp%3Bdata%5B*%5D.author.badge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=0&limit=7&sort_by=created`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/people/${id}/answers`,
            Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].author.name}的知乎回答`,
        link: `https://www.zhihu.com/people/${id}/answers`,
        description: data[0].author.headline || data[0].author.description,
        item:
            data &&
            data.map((item) => ({
                title: item.question.title,
                description: utils.ProcessImage(item.content),
                pubDate: new Date(item.created_time * 1000).toUTCString(),
                link: `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`,
            })),
    };
};
