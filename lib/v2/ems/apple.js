const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.ems.com.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `${rootUrl}/apple/query/${id}`;
    const APIUrl = `${rootUrl}/apple/getMailNoLastRoutes`;

    const { trails } = await got
        .post(APIUrl, {
            form: {
                mailNum: id,
            },
        })
        .json();

    let item;
    try {
        item = [
            {
                title: `${trails[0][0].despatchCity} → ${trails[0][0].destinationCity}`,
                link,
                description: art(path.join(__dirname, 'templates/apple.art'), {
                    trails: trails[0],
                }),
                guid: trails[0][0],
            },
        ];
    } catch (e) {
        throw new Error(`没有找到 ${id} 的信息，请检查是否输入正确或者稍后再试。`);
    }

    ctx.state.data = {
        allowEmpty: true,
        title: `Apple EMS 快递 ${id}`,
        link,
        item,
    };
};
