const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.ems.com.cn/apple';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `${rootUrl}/query/${id}`;
    const APIUrl = `${rootUrl}/getMailNoLastRoutes`;

    const { trails } = await got
        .post(APIUrl, {
            form: {
                mailNum: id,
            },
        })
        .json();

    const item = trails[0]
        ? [
              {
                  title: `${trails[0][0].despatchCity} → ${trails[0][0].destinationCity}`,
                  link,
                  description: art(path.join(__dirname, 'templates/apple.art'), {
                      trails: trails[0],
                  }),
                  guid: trails[0][0],
              },
          ]
        : {};

    ctx.state.data = {
        allowEmpty: true,
        title: `Apple EMS 快递 ${id}`,
        link,
        item,
    };
};
