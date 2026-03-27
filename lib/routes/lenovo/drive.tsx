import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/drive/:selName',
    categories: ['program-update'],
    example: '/lenovo/drive/PF3WRD2G',
    parameters: { selName: '产品序列号' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lenovo.com.cn'],
            target: '/drive/:selName',
        },
    ],
    name: '驱动',
    maintainers: ['cscnk52'],
    handler,
};

export async function handler(ctx) {
    const selName = ctx.req.param('selName');
    const link = `https://newsupport.lenovo.com.cn/api/drive/drive_listnew?searchKey=${selName}`;

    const response = await ofetch(link);

    if (response.statusCode !== 200) {
        throw new InvalidParameterError(`无效序列号, 请检查你的序列号是否正确.`);
    }

    const driveList = response.data.partList.flatMap((part) => part.drivelist);

    const items: DataItem[] = driveList.map(
        (item) =>
            ({
                title: `${item.DriverName} ${item.Version}`,
                link: `https://newsupport.lenovo.com.cn/driveDownloads_detail.html?driveId=${item.DriverEdtionId}`,
                description: renderToString(<DriveDescription driveName={item.DriverName} driveCode={item.DriverCode} driveVersion={item.Version} downloadFileName={item.FileName} downloadFilePath={item.FilePath} />),
                pubDate: parseDate(item.CreateTime, +8),
            }) as DataItem
    );

    return {
        title: `${response.data.driverSerious[0].NodeCode} 驱动`,
        item: items,
        language: 'zh-CN',
    } as Data;
}

const DriveDescription = ({ driveName, driveCode, driveVersion, downloadFileName, downloadFilePath }: { driveName: string; driveCode: string; driveVersion: string; downloadFileName: string; downloadFilePath: string }) => (
    <div class="driver-info">
        <h2>驱动信息</h2>
        <ul>
            <li>
                <strong>驱动名称：</strong>
                {driveName}
            </li>
            <li>
                <strong>驱动编码：</strong>
                {driveCode}
            </li>
            <li>
                <strong>驱动版本：</strong>
                {driveVersion}
            </li>
            <li>
                <strong>下载地址：</strong>
                <a href={downloadFilePath} download>
                    {downloadFileName}
                </a>
            </li>
        </ul>
    </div>
);
