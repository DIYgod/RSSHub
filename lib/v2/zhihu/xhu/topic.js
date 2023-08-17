const got = require('@/utils/got');
const auth = require('./auth');
const utils = require('../utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const xhu = await auth.Get();
    const { topicId } = ctx.params;
    const link = `https://www.zhihu.com/topic/${topicId}/newest`;
    const url = `https://api.zhihuvvv.workers.dev/topics/${topicId}/feeds/timeline_activity?include=data%5B%3F%28target.type%3Dtopic_sticky_module%29%5D.target.data%5B%3F%28target.type%3Danswer%29%5D.target.content%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%3Bdata%5B%3F%28target.type%3Dtopic_sticky_module%29%5D.target.data%5B%3F%28target.type%3Danswer%29%5D.target.is_normal%2Ccomment_count%2Cvoteup_count%2Ccontent%2Crelevant_info%2Cexcerpt.author.badge%5B%3F%28type%3Dbest_answerer%29%5D.topics%3Bdata%5B%3F%28target.type%3Dtopic_sticky_module%29%5D.target.data%5B%3F%28target.type%3Darticle%29%5D.target.content%2Cvoteup_count%2Ccomment_count%2Cvoting%2Cauthor.badge%5B%3F%28type%3Dbest_answerer%29%5D.topics%3Bdata%5B%3F%28target.type%3Dtopic_sticky_module%29%5D.target.data%5B%3F%28target.type%3Dpeople%29%5D.target.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F%28type%3Dbest_answerer%29%5D.topics%3Bdata%5B%3F%28target.type%3Danswer%29%5D.target.annotation_detail%2Ccontent%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%3Bdata%5B%3F%28target.type%3Danswer%29%5D.target.author.badge%5B%3F%28type%3Dbest_answerer%29%5D.topics%3Bdata%5B%3F%28target.type%3Darticle%29%5D.target.annotation_detail%2Ccontent%2Cauthor.badge%5B%3F%28type%3Dbest_answerer%29%5D.topics%3Bdata%5B%3F%28target.type%3Dquestion%29%5D.target.annotation_detail%2Ccomment_count&limit=20`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhu.cookie,
        },
    });
    const listRes = response.data.data;

    ctx.state.data = {
        title: `知乎话题-${topicId}`,
        link,
        item: listRes.map(({ target: item }) => {
            const type = item.type;
            let title = '';
            let description = '';
            let link = '';
            let pubDate = '';
            let author = '';

            switch (type) {
                case 'answer':
                    title = `${item.question.title}-${item.author.name}的回答：${item.excerpt}`;
                    description = `<strong>${item.question.title}</strong><br>${item.author.name}的回答<br/>${utils.ProcessImage(item.content)}`;
                    link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
                    pubDate = parseDate(item.updated_time * 1000);
                    author = item.author.name;
                    break;

                case 'question':
                    title = item.title;
                    description = item.title;
                    link = `https://www.zhihu.com/question/${item.id}`;
                    pubDate = parseDate(item.created * 1000);
                    break;

                case 'article':
                    title = item.title;
                    description = item.excerpt;
                    link = item.url;
                    pubDate = parseDate(item.created * 1000);
                    break;

                default:
                    description = `未知类型 ${topicId}.${type}，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
            }

            return {
                title,
                description,
                author,
                pubDate,
                guid: link,
                link,
            };
        }),
    };
};
