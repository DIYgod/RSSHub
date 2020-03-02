const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://www.icourse163.org/category/all';
    const homePage = await got({
        method: 'get',
        url: link,
    });
    const csrfKey = homePage.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await got({
        method: 'post',
        url: `https://www.icourse163.org/web/j/courseBean.getCoursePanelListByFrontCategory.rpc?csrfKey=${csrfKey}`,
        headers: {
            Cookie: `NTESSTUDYSI=${csrfKey};`,
        },
        form: {
            categoryId: -1,
            type: 30,
            orderBy: 10,
            pageIndex: 1,
            pageSize: 20,
        },
    });

    const items = response.data.result.result.map((item) => {
        const title = item.name;
        const link = `https://www.icourse163.org/course/${item.schoolPanel.shortName}-${item.id}`;
        const lectors = item.termPanel.lectorPanels.reduce((lectors, lector) => {
            lectors += `${lector.realName || lector.nickName}、`;
            return lectors;
        }, '');
        const tags = (item.mocTagDtos || []).reduce((tags, tag) => {
            tags += `${tag.name}、`;
            return tags;
        }, '');
        const startTime = new Date(item.termPanel.startTime);
        const startYear = startTime.getFullYear();
        const startMonth = (startTime.getMonth() + 1).toString().padStart(2, '0');
        const startDate = startTime.getDate();
        const startTimeString = item.termPanel.startTime === 32503651201000 ? '待定' : `${startYear}-${startMonth}-${startDate}`;
        const media = item.VideoUrl
            ? `
        <p>
          <video
              controls="controls"
              style="width: 100%;"
              poster="${item.imgUrl}"
              src="https://v.stu.126.net/mooc-video/${item.VideoUrl}"
              >
        </p>
      `
            : `<img src="${item.imgUrl}"><br>`;
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
        };
    });

    ctx.state.data = {
        title: '中国大学MOOC(慕课)-最新',
        link,
        description:
            '中国大学MOOC(慕课) 是爱课程网携手网易云课堂打造的在线学习平台，每一个有提升愿望的人，都可以在这里学习中国优质的大学课程，学完还能获得认证证书。中国大学MOOC是国内优质的中文MOOC学习平台，拥有众多985高校的大学课程，与名师零距离。',
        item: items,
    };
};
