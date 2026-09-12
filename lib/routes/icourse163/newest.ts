import dayjs from 'dayjs';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/newest',
    categories: ['study'],
    example: '/icourse163/newest',
    name: '最新',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const link = 'https://www.icourse163.org/category/all';
    const homePage = await ofetch.raw(link);
    const csrfKey = homePage.headers.getSetCookie()[0].split(';', 1)[0].split('=', 2)[1];

    const response = await ofetch(`https://www.icourse163.org/web/j/courseBean.getCoursePanelListByFrontCategory.rpc?csrfKey=${csrfKey}`, {
        method: 'POST',
        headers: {
            Cookie: `NTESSTUDYSI=${csrfKey};`,
        },
        body: new URLSearchParams({
            categoryId: '-1',
            type: '30',
            orderBy: '10',
            pageIndex: '1',
            pageSize: '20',
        }),
    });

    const items = response.result.result.map((item) => {
        const title = item.name;
        const link = `https://www.icourse163.org/course/${item.schoolPanel.shortName}-${item.id}`;
        const lectors = item.termPanel.lectorPanels.map((lector) => `${lector.realName || lector.nickName}、`).join('');
        const category = (item.mocTagDtos || []).map((tag) => tag.name);
        const tags = category.join('、');
        const startTimeString = item.termPanel.startTime === 32_503_651_201_000 ? '待定' : dayjs(item.termPanel.startTime).format('YYYY-MM-DD');
        const media = item.VideoUrl
            ? `
        <p>
          <video
              controls
              preload="metadata"
              style="width: 100%;"
              poster="${item.imgUrl.split('?', 1)[0]}"
              src="https://v.stu.126.net/mooc-video/${item.VideoUrl}"
              >
        </p>
      `
            : `<img src="${item.imgUrl.split('?', 1)[0]}"><br>`;
        const description = `
      <strong>${title}</strong><br>
      ${tags}<br>
      ${item.schoolPanel.name} ${lectors}<br>
      开课时间: ${startTimeString}<br><br>
      ${media}
      ${(item.termPanel.jsonContent || '').replace('spContent=', '')}
    `;

        return {
            title,
            link,
            description,
            category,
        };
    });

    return {
        title: '中国大学MOOC(慕课)-最新',
        link,
        description:
            '中国大学MOOC(慕课) 是爱课程网携手网易云课堂打造的在线学习平台，每一个有提升愿望的人，都可以在这里学习中国优质的大学课程，学完还能获得认证证书。中国大学MOOC是国内优质的中文MOOC学习平台，拥有众多985高校的大学课程，与名师零距离。',
        item: items,
    };
}
