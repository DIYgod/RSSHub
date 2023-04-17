const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://e.ecust.edu.cn';

module.exports = async (ctx) => {
    const { data: response } = await got.post(`${baseUrl}/engine2/general/1301/type/more-datas`, {
        form: {
            engineInstanceId: 1732458,
            pageNum: 1,
            pageSize: 20,
            typeId: 4562497,
            topTypeId: '',
            sw: '',
        },
    });

    const list = response.data.datas.datas.map((item) => ({
        title: item['1'].value,
        link: item.url.startsWith('http') ? item.url : `${baseUrl}/engine2/d/${item.id}/${item.engineInstanceId}/0`,
        pubDate: timezone(parseDate(item['6'].value), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.includes('toPhoneSign')) {
                    return item;
                }
                const { data: response } = await got(item.link);
                item.description = JSON.parse(response.match(/"content":(".*")(?:,"sequence":\d+)?,"typePath"/)[1]);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '华东理工继续教育学院',
        description: '学院公告',
        link: `${baseUrl}/engine2/m/38F638B77773ADD3`,
        item: items,
    };
};
