// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://rszhaopin.bit.edu.cn';
    const apiUrl = `${rootUrl}/ajax/ajaxService`;
    const currentUrl = `${rootUrl}/zp.html#/notices/0`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            __xml: 'A2GgW6kPrLjaqavT0I8o9cOIXCYxazGialM66OpRk0MhwwOeUI1mF8yRBJHzicA9uL8Y9gYrXjdMocslRUopTMDJSRAykGXsjUoPibT4uK8Rz8Zj7U00coBCcJibpVwRZzFk',
            __type: 'extTrans',
        },
    });

    const items = response.data.return_data.list.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: parseDate(item.createtime),
        link: `${rootUrl}/zp.html#/notice/${item.id}`,
    }));

    ctx.set('data', {
        title: '人才招聘 - 北京理工大学',
        link: currentUrl,
        item: items,
    });
};
