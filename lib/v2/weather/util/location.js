const got = require('@/utils/got');
const config = require('@/config').value;
module.exports = {
    getLocationID: async (ctx, location) => {
        const response = await got.get(`https://geoapi.qweather.com/v2/city/lookup?location=${location}&key=${config.hefeng.key}`);
        const data = [];
        for (const i in response.data.location) {
            data.push(response.data.location[i]);
        }
        return data[0].id;
    },
};
