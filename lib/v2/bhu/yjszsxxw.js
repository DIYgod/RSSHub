const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    506189: {
        key: '506189',
        name: '最新公告',
    },
};

// 反爬严格

const host = 'https://yjszsxxw.bhu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/engine2/general/506189/type/more-datas`;
    const response = await got({
        method: 'post',
        url: pageUrl,
        headers: {
            Cookie: `current_page_id=85721; website_id=63018; website_fid=138779; website_fid_login=1; mh_sign=c59a12a69a86dfb3a5a12f04102f8f8d`,
            Host: 'yjszsxxw.bhu.edu.cn',
            Origin: 'https://yjszsxxw.bhu.edu.cn',
            Referer: 'https://yjszsxxw.bhu.edu.cn/engine2/general/more?appId=506189&pageId=85721&wfwfid=138779&websiteId=63018&rootAppId=',
        },
        form: {
            info: JSON.stringify({
                engineInstanceId: 656393,
                pageNum: 1,
                pageSize: 20,
                typeId: 2984613,
                sw: '',
            }),
        },
    });
    const list = response.data;
    // console.log(list);

    const typeName = type.name || '研究生院';
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.fbsj;
            const itemTitle = item.xxbt;
            return ctx.cache.tryGet(item.id, async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'post',
                        url: 'https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/getZsxx',
                        headers: {
                            Origin: 'https://yzb.hitsz.edu.cn',
                            Referer: `https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/index?id=${item.id}&xxlm=${type.key}`,
                        },
                        form: {
                            info: JSON.stringify({ id: item.id }),
                        },
                    });
                    description = result.data.module.data.pcdxxnr;
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: `https://yzb.hitsz.edu.cn/yzs_common/zsxxxq/index?id=${item.id}&xxlm=${type.key}`,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `渤海大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `渤海大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
