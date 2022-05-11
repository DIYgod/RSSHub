const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;
const md5 = require('@/utils/md5');
const g_encrypt = require('./execlib/g_encrypt');

module.exports = async (ctx) => {
    const cookie = config.zhihu.cookies_no_login;
    if (cookie === undefined) {
        throw Error('缺少知乎Cookie 值(不需要登录即可抓取Cookie)'); // the key is "d_c0"
    }

    const { questionId } = ctx.params;
    const sort = 'updated'; // or default,created
    const limit = 20;
    const include = "data%5B*%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cattachment%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Crelevant_info%2Cquestion%2Cexcerpt%2Cis_labeled%2Cpaid_info%2Cpaid_info_content%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%2Cis_recognized%3Bdata%5B*%5D.mark_infos%5B*%5D.url%3Bdata%5B*%5D.author.follower_count%2Cbadge%5B*%5D.topics%3Bdata%5B*%5D.settings.table_of_content.enabled&offset=0";
    const url = `https://www.zhihu.com/api/v4/questions/${questionId}/answers?include=${include}&limit=${limit}&sort_by=${sort}&platform=desktop`;

    // calcuate x-zse-96, see https://github.com/srx-2000/spider_collection/issues/18
    const pattern = /d_c0=(\S*);/;
    const cookie_mes = cookie.match(pattern)[1];
    const parse_url = url.replace("https://www.zhihu.com", "");
    const f = "101_3_2.0" + "+" + parse_url + "+" + cookie_mes;
    const xzse96 = '2.0_' + g_encrypt(md5(f));

    const _header = {cookie, 'x-zse-96':xzse96, 'x-app-za': 'OS=Web', 'x-zse-93': '101_3_2.0'};
    const response = await got({
        method: 'get',
        url,
        headers: {
	    ...utils.header,
	    ..._header,
            Referer: `https://www.zhihu.com/question/${questionId}`,
            // Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js, no need any more
        },
    });
    const listRes = response.data.data;

    ctx.state.data = {
        title: `知乎-${listRes[0].question.title}`,
        link: `https://www.zhihu.com/question/${questionId}`,
        item: listRes.map((item) => {
            const title = `${item.author.name}的回答：${item.excerpt}`;
            const description = `${item.author.name}的回答<br/><br/>${utils.ProcessImage(item.content)}`;

            return {
                title,
                description,
                author: item.author.name,
                pubDate: new Date(item.updated_time * 1000).toUTCString(),
                guid: item.id.toString(),
                link: `https://www.zhihu.com/question/${questionId}/answer/${item.id}`,
            };
        }),
    };
};
