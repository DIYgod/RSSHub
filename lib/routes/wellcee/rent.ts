import path from 'node:path';

import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import type { District, House } from './types';
import { baseUrl, getCitys, getDistricts } from './utils';

const render = (data) => art(path.join(__dirname, 'templates/house.art'), data);

export const route: Route = {
    path: '/rent/:city/:district?',
    example: '/wellcee/rent/北京',
    parameters: {
        city: '城市',
        district: '地区',
    },
    name: '租房信息',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.wellcee.com',
    description: '支持的城市可以通过 [/wellcee/support-city](https://rsshub.app/wellcee/support-city) 获取',
};

async function handler(ctx: Context) {
    const { city, district = '' } = ctx.req.param();
    const citys = await getCitys();
    const cityInfo = citys.find((item) => item.chCityName === city);
    if (!cityInfo) {
        throw new InvalidParameterError('Invalid city');
    }

    let districtInfo: District | undefined;
    if (district) {
        const districts = await getDistricts(cityInfo.id);
        const d = districts.find((item) => item.name === district);
        if (!d) {
            throw new InvalidParameterError('Invalid district');
        }
        districtInfo = d;
    }

    const response = await ofetch(`${baseUrl}/api/house/filter`, {
        method: 'POST',
        body: {
            districtIds: districtInfo?.id ? [districtInfo.id] : [],
            subways: [],
            rentTypeIds: [],
            timeTypeIds: [],
            price: [],
            tagTypeIds: [],
            cityId: cityInfo.id,
            lang: 1,
            pn: 1,
        },
    });

    const items = (response.data.list as House[]).map((item) => ({
        title: item.address,
        link: `${baseUrl}/rent-apartment/${item.id}`,
        description: render({ item }),
        pubDate: parseDate(item.loginTime, 'X'),
        author: item.userInfo.name,
        category: [...item.tags, ...item.typeTags],
    }));

    return {
        title: `${city}${districtInfo?.name ?? ''}租房信息 - Wellcee`,
        description: `${cityInfo.statics.online_text} ${cityInfo.statics.total_text}`,
        image: cityInfo.icon,
        icon: cityInfo.icon,
        logo: cityInfo.icon,
        link: `${baseUrl}/rent-apartment/${cityInfo.cityName}/list?cityId=${cityInfo.id}&lang=zh${district ? `#districtIds=${districtInfo?.id}` : ''}`,
        item: items,
    };
}
