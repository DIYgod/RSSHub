const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    506189: {
        key: '506189',
        name: '最新公告',
        typeId: 2984613,
        engineInstanceId: 656393,
    },
};

const host = 'https://yjszsxxw.bhu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/engine2/general/${type.key}/type/more-datas`;
    const response = await got({
        method: 'post',
        url: pageUrl,
        form: {
            engineInstanceId: type.engineInstanceId,
            pageNum: 1,
            pageSize: 20,
            typeId: type.typeId,
            sw: '',
        },
    });
    const list = response.data.data.datas.datas;
    const typeName = type.name || '研究生院';
    const items = list.map((item) => {
        const itemDate = item[6].value;
        const itemTitle = item[1].value;
        const itemPath = item.url;
        const itemUrl = new URL(itemPath, pageUrl).href;
        return {
            title: itemTitle,
            link: itemUrl,
            description: itemTitle,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `渤海大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `渤海大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
