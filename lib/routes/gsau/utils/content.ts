import type { DataItem } from '@/types';

export const generateRssItemForUnsupportedLink = (title: string, date: string, url: string): DataItem => {
    const htmlContent = `
<p>
    抱歉，本文章 <u>${title}</u> 来源非甘肃农业大学官方网站，不支持解析。<br/>
    请通过链接查看原文：<a href="${url}">${url}</a>
</p>
<p>
    Sorry, the provenance of article <u>${title}</u> is not from official website of Gansu Agriculture University,
    and it's not supported to parse. <br/>
    Please read the origin website by link: <a href="${url}">${url}</a>
</p>
`;
    const textContent = `
抱歉，本文章 ${title} 来源非甘肃农业大学官方网站，不支持解析。
请通过链接查看原文：${url}
Sorry, the provenance of article ${title} is not from official website of Gansu Agriculture University,
and it's not supported to parse. Please read the origin website by link: ${url}
`;
    return {
        title,
        pubDate: date,
        link: url,
        description: htmlContent,
        category: ['university'],
        guid: url,
        id: url,
        image: 'https://www.gsau.edu.cn/images/foot_03.jpg',
        content: {
            text: textContent,
            html: htmlContent,
        },
        updated: date,
        language: 'zh-cn',
    };
};
