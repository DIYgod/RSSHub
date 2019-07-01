const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseUrl = 'http://www.ceic.ac.cn';
    const api = `${baseUrl}/ajax/speedsearch?num=${type}`;
    const mappings = {
        O_TIME: '发震时刻(UTC+8)',
        EPI_LAT: '纬度(°)',
        EPI_LON: '经度(°)',
        EPI_DEPTH: '深度(千米)',
        LOCATION_C: '参考位置',
        M: '震级(M)',
        SAVE_TIME: '录入时间',
    };

    const typeMappings = {
        1: '最近24小时地震信息',
        2: '最近48小时地震信息',
        3: '最近7天地震信息',
        4: '最近30天地震信息',
        5: '最近一年3.0级以上地震信息',
        6: '最近一年地震信息',
        7: '最近一年3.0级以下地震',
        8: '最近一年4.0级以上地震信息',
        9: '最近一年5.0级以上地震信息',
        0: '最近一年6.0级以上地震信息',
    };
    const typeName = typeMappings[type];

    const response = await got(api);
    const data = response.data;
    const json = JSON.parse(data.substring(1, data.length - 1)).shuju;

    ctx.state.data = {
        title: typeName,
        link: `${baseUrl}/speedsearch`,
        item: json.map((entity) => {
            const contentBuilder = [];
            const { NEW_DID } = entity;
            for (let mappingsKey in mappings) {
                contentBuilder.push(`${mappings[mappingsKey]} ${entity[mappingsKey]}`);
            }

            return {
                title: contentBuilder.join('，'),
                link: `${baseUrl}/${NEW_DID}.html`,
                pubDate: new Date(entity.O_TIME).toUTCString(),
                description: contentBuilder.join('<br>'),
                guid: NEW_DID,
            };
        }),
    };
};
