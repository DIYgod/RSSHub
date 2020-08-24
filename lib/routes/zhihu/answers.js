const got = require('@/utils/got');
const utils = require('./utils');
const crypto = require('crypto');
const jsencrypt = require('./execlib/jsencrypt');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const d_c0 = await getDC0FromCookies(id);

    const zst81 =
        '3_2.0ae3TnRUTEvOOUCNMTQnTSHUZo02p-HNMZBO8YD_q2Xtuo_Y0K6P0E6uy-LS9-hp1DufI-we8gGHPgJO1xuPZ0GxCTJHR7820XM20cLRGDJXfgGCBxupMuD_Ic4cpr4w0mRPO7HoY70SfquPmz93mhDQyiqV9ebO1hwOYiiR0ELYuUrxmtDomqU7ynXtOnAoTh_PhRDSTF82VVh29ZhFL1bUYbLgszUc04wFMCrLf9ucOA9HYMGVmzDwyJG2_tJSC4CeTveg11UY9qcX0DhoY2eS1u9efxCVqxGYMhrxyqh2pwucY8bSBwge0Vbx8fBtYWuVMcqumUqSBchLCzJLOErpL3hepEgHfyuYBZrx9oBo1o7NY7CL_fh90Vqkwq9COGMVYzc9BnugLJCw9-GXmShgO0h3KHU2YsQx0zqxY8DNmuUwOMwt1oMOOQvN_iBg8ZqVBtbo_rDwVQvw1JUNmZcN_wBSBAD3KwqN83rO0QTLsWwYC';
    const zse83 = '3_2.0';

    const path = `/api/v4/members/${id}/answers?include=data%5B*%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Cmark_infos%2Ccreated_time%2Cupdated_time%2Creview_info%2Cexcerpt%2Cis_labeled%2Clabel_info%2Crelationship.is_authorized%2Cvoting%2Cis_author%2Cis_thanked%2Cis_nothelp%2Cis_recognized%3Bdata%5B*%5D.author.badge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B*%5D.question.has_publishing_draft%2Crelationship&offset=0&limit=20&sort_by=created`;
    const currenURI = `https://www.zhihu.com/people/${id}/answers`;

    const tmp = [zse83, path, currenURI, d_c0, zst81].join('+');
    const md5 = crypto.createHash('md5');
    const signature = jsencrypt(md5.update(tmp).digest('hex'));

    const xzseHeaders = {
        'x-zse-83': zse83,
        'x-zse-86': '1.0_' + signature,
        'x-zst-81': zst81,
    };

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com${path}`,
        headers: {
            ...utils.header,
            ...xzseHeaders,
            Referer: `https://www.zhihu.com/people/${id}/answers`,
            cookie: `d_c0=${d_c0}`,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].author.name}的知乎回答`,
        link: `https://www.zhihu.com/people/${id}/answers`,
        description: data[0].author.headline || data[0].author.description,
        item: data.map((item) => ({
            title: item.question.title,
            description: utils.ProcessImage(item.content),
            pubDate: new Date(item.created_time * 1000).toUTCString(),
            link: `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`,
        })),
    };
};

async function getDC0FromCookies(id) {
    const url = `https://www.zhihu.com/people/${id}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            ...utils.header,
        },
    });

    const targetCookies = (response.headers['set-cookie'] || []).filter((c) => /d_c0=([^;]+)/.test(c));
    const matchResult = (targetCookies[0] || '').match(new RegExp('d_c0=([^;]+)'));

    return matchResult[1] || '';
}
