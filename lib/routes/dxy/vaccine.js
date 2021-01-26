const got = require('@/utils/got');

module.exports = async (ctx) => {
    const province = ctx.params.province || '';
    const city = ctx.params.city || '';
    const location = ctx.params.location || '';
    const fullLocation = `${province ? `${province}${city ? `/${city}${location ? `/${location}` : ''}` : ''}` : ''}`;

    const rootUrl = 'https://mama.dxy.com';
    const currentUrl = `${rootUrl}/client/vaccine/new-crown-vaccine`;
    const apiUrl = `${rootUrl}/api/vaccine/client/vaccination-point/all`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const response = await got({
        method: 'get',
        url: apiResponse.data.results.fileUrl,
    });

    const allPoints = [],
        allLocations = {},
        allLocationIds = {},
        pointDataArray = response.data.results.pointData;

    for (const data of pointDataArray) {
        allLocations[data.locationName] = data.locationId;
        allLocationIds[data.locationId] = data.locationName;
        if (data.points) {
            allPoints.push(...data.points);
        } else {
            pointDataArray.push(...data.pointData);
        }
    }

    const list = allPoints.map((item) => {
        const locationId = item.locationId;
        const province = locationId - (locationId % 10000);
        const city = locationId - (locationId % 100);

        return {
            title: `${allLocationIds[province]}/${allLocationIds.hasOwnProperty(city) ? `${allLocationIds[city]}/` : `${allLocationIds[province]}/`}${allLocationIds[locationId]}`,
            link: item.contentUrl,
            pubDate: new Date(item.modifyDate).toUTCString(),
        };
    });

    const items = await Promise.all(
        list
            .filter((item) => {
                if (fullLocation !== '') {
                    const locationSplit = item.title.split('/');
                    const fullLocationSplit = fullLocation.split('/');

                    for (let index = 0; index < fullLocationSplit.length; index++) {
                        if (locationSplit[index] !== fullLocationSplit[index]) {
                            return false;
                        }
                    }
                }
                return true;
            })
            .map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const result = detailResponse.data.results;

                        const description =
                            `<h1> ${result.point.pointName}</h1>` +
                            '<ul>' +
                            `<li>户籍限制：${result.point.registerLimit}</li>` +
                            `<li>服务限制：${result.point.serviceTag}</li>` +
                            `<li>服务时间：${result.detail.serviceTime}</li>` +
                            `<li>地址：${result.point.address}</li>` +
                            `<li>电话：${result.point.phoneNo}</li>` +
                            `<li>接种人群：${result.detail.targetPeople}</li>` +
                            `<li>接种所需材料：${result.detail.materials}</li>` +
                            `<li>预约步骤：${result.detail.reserveSteps}</li>` +
                            '</ul>';

                        item.description = description;
                        item.title = `${result.point.pointName}（${item.title}）`;
                        item.link = `${rootUrl}/client/vaccine/vaccination-point?pointId=${result.point.id}`;

                        return item;
                    })
            )
    );

    ctx.state.data = {
        title: `新冠疫苗接种点查询${fullLocation ? `（${fullLocation}）` : ''} - 丁香园`,
        link: currentUrl,
        item: items,
    };
};
