const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const area = isNaN(city) ? city : `@${city}`;

    const response = await axios({
        method: 'get',
        url: `http://aqicn.org/aqicn/json/android/${area}/json`,
    });
    const data = response.data;

    ctx.state.data = {
        title: `${data.namena}AQI`,
        link: `https://aqicn.org/city/${data.ids.path}`,
        description: `${data.namena}AQI-aqi.org`,
        item: [
            {
                title: `${data.namena}实时空气质量(AQI)${data.utimecn}`,
                description: `${data.infocn}<br>风力:${data.cwind[0]}级<br>污染物:${data.nearest[0].pol}<br><img referrerpolicy="no-referrer" src="${data.wgt}">`,
                pubDate: new Date(data.time * 1000).toUTCString(),
                guid: data.time,
                link: `https://aqicn.org/city/${data.ids.path}`,
            },
        ],
    };
};
