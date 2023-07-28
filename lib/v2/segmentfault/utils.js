const zlib = require('zlib');
const got = require('@/utils/got');
const config = require('@/config').value;
const { getAcwScV2ByArg1 } = require('@/v2/5eplay/utils');

const acw_sc__v2 = (link, tryGet) =>
    tryGet(
        'segmentfault:acw_sc__v2',
        async () => {
            const response = await got(link, {
                decompress: false,
            });

            const unzipData = zlib.createUnzip();
            unzipData.write(response.body);

            let acw_sc__v2 = '';
            for await (const data of unzipData) {
                const strData = data.toString();
                const matches = strData.match(/var arg1='(.*?)';/);
                if (matches) {
                    acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
                    break;
                }
            }
            return acw_sc__v2;
        },
        config.cache.routeExpire,
        false
    );

module.exports = {
    acw_sc__v2,
};
