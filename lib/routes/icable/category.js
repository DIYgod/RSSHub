const got = require('@/utils/got');

function desc(item, option) {
    if (option === 'brief') {
        let ptext;
        let btext;
        // remove HTML tags from item.desc (exception for undefined or null item.desc)
        if (item.desc) {
            ptext = item.desc.replace(/<\/?[^>]+(>|$)/g, '');
        } else {
            ptext = item.desc;
        }
        // brief desc counts within 100 characters
        if (ptext && ptext.length && ptext.length > 100) {
            btext = `${ptext.substring(0, 100)}…`;
        } else {
            btext = ptext;
        }
        return `<p>${btext}<br><br>(${item.created_at})</p>`;
    } else {
        return `<img src="${item.pic_url}"><p>${item.desc}</p>`;
    }
}

module.exports = async (ctx) => {
    const option = ctx.params.option || 'default';

    const api37 = await got({
        method: 'get',
        url: `https://news.i-cable.com/ott_api/contents?tagId=37&locale=zh_hk`,
        headers: {
            'x-api-key': `c8k8k0ogo4ggs40owsg0g8g48k80o4wwkg4gc00k`,
        },
    });
    const api38 = await got({
        method: 'get',
        url: `https://news.i-cable.com/ott_api/contents?tagId=38&locale=zh_hk`,
        headers: {
            'x-api-key': `c8k8k0ogo4ggs40owsg0g8g48k80o4wwkg4gc00k`,
        },
    });
    const api_resp_37 = api37.data.response;
    const api_resp_38 = api38.data.response;
    // merge API responses
    let api_resp = [...api_resp_37, ...api_resp_38];
    // sorting
    api_resp = api_resp.sort((a, b) => Number(b.id) - Number(a.id));
    // remove duplicates and programmes
    api_resp = api_resp.filter((resp, i, arr) => {
        if (resp.is_program === '1') {
            return false;
        }
        if (i === 0) {
            return true;
        } else {
            if (resp.id === arr[i - 1].id) {
                return false;
            } else {
                return true;
            }
        }
    });

    const items = api_resp.map((item) => ({
        title: item.title, // 文章标题
        author: '有線新聞', // 文章作者
        description: desc(item, option),
        pubDate: `${item.created_at} +0800`, // 文章发布时间
        guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
        link: `http://cablenews.i-cable.com/ci/news/article/${item.vod_id}/${item.id}`, // 指向文章的链接
    }));

    ctx.state.data = {
        title: 'i-CABLE 即時新聞', // feedTitle
        link: 'http://cablenews.i-cable.com/ci/news/listing', // feedURL
        description: '有線新聞 - 走在事實最前線', // feedDesc
        item: items,
    };
};
