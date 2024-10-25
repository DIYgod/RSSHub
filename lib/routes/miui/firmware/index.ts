import { Route } from '@/types';
import got from '@/utils/got';
import queryString from 'query-string';

export const route: Route = {
    path: '/firmware/:device/:type?/:region?',
    categories: ['program-update'],
    example: '/miui/firmware/aries',
    parameters: { device: 'the device `codename` eg. `aries` for Mi 2S', type: 'type', region: 'Region, default to `cn`' },
    name: 'New firmware',
    maintainers: ['Indexyz'],
    description: `  | stable  | development |
  | ------- | ----------- |
  | release | dev         |

  | region | region |
  | ------ | ------ |
  | China  | cn     |
  | Global | global |`,
    handler,
};

async function handler(ctx) {
    const { type = 'release', device, region = 'cn' } = ctx.req.param();
    const releaseType = type === 'release' ? 'F' : 'X';
    const localeTypeName = type === 'release' ? '稳定版' : '开发版';
    const regionName = region === 'global' ? 'global' : 'cn';

    const response = await got({
        method: 'get',
        url: 'http://update.miui.com/updates/miota-fullrom.php',
        searchParams: queryString.stringify({
            d: device,
            b: releaseType,
            r: regionName,
            l: 'zh_CN',
            n: '',
        }),
    });

    const responseData = response.data;

    return {
        title: `MIUI 更新 - ${device} - ${type === 'release' ? '稳定版' : '开发版'}`,
        link: 'http://www.miui.com/download.html',
        item: [
            {
                title: `${device} 有新的 ${localeTypeName}本: ${responseData.LatestFullRom.version}`,
                guid: responseData.LatestFullRom.md5,
                description: responseData.LatestFullRom.filename,
                link: responseData.LatestFullRom.descriptionUrl,
            },
        ],
    };
}
