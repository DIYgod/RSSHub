const got = require('@/utils/got');

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const pollution = ctx.params.pollution || [];
    const pollutionType = {
        so2: 'so2',
        no2: 'no2',
        co: 'co',
        o3: 'O3',
        pm25: 'PM2.5',
        pm10: 'PM10',
    };
    const area = isNaN(city) ? city : `@${city}`;

    const response = await got({
        method: 'get',
        url: `http://aqicn.org/aqicn/json/android/${area}/json`,
    });
    const data = response.data;

    const pollutionDetailed =
        pollution.length === 0
            ? ''
            : pollution.split(',').reduce((result, item) => {
                  result += `${pollutionType[item].toUpperCase()}:<b>${
                      typeof data.historic[pollutionType[item]] === 'object' ? data.historic[pollutionType[item]][Object.keys(data.historic[pollutionType[item]])[0]] : data.historic[pollutionType[item]][0]
                  }</b><br>`;
                  return result;
              }, '');

    ctx.state.data = {
        title: `${data.namena}AQI`,
        link: `https://aqicn.org/city/${data.ids.path}`,
        description: `${data.namena}AQI-aqicn.org`,
        item: [
            {
                title: `${data.namena}实时空气质量(AQI)${data.utimecn}`,
                description: `${data.infocn}<br>风力:<b>${data.cwind[0]}</b>级<br>AQI:<b>${data.aqi}</b><br>${pollutionDetailed}<img src="${data.wgt}">`,
                pubDate: new Date(data.time * 1000).toUTCString(),
                guid: data.time,
                link: `https://aqicn.org/city/${data.ids.path}`,
            },
        ],
    };
};
