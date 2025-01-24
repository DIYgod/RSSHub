import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import iconv from 'iconv-lite';
import type { AlertItem } from './types';
import { generateContent } from './content';

const BASE_URL = 'http://www.12379.cn/data/alarm_list_all.html';

const handler: Route['handler'] = async (context) => {
    const filterWords = context.req.param('filter').split(',').sort();
    const feedLink = `https://rsshub.app/12379/alert/${filterWords.join(',')}`;

    // Fetch the index page
    const { data: response } = await got(BASE_URL, {
        responseType: 'buffer',
    });
    const originAlertItems: AlertItem[] = JSON.parse(iconv.decode(response, 'UTF-8')).alertData;
    const filteredAlertItems = originAlertItems.filter((alert) => filterWords.some((filterWord) => alert.description.includes(filterWord) || alert.headline.includes(filterWord)));

    return {
        title: '国家突发事件预警信息发布',
        description: '国家突发事件预警信息实时发布',
        link: BASE_URL,
        image: 'http://www.12379.cn/html/new2018/img/logo.png',
        item: filteredAlertItems.map((alertItem) => {
            const link = `http://www.12379.cn/html/new2018/alarmcontent.shtml?file=${alertItem.identifier}.html`;
            const htmlContent = generateContent(alertItem);
            return {
                title: alertItem.headline,
                pubDate: alertItem.ctime,
                link,
                description: htmlContent,
                category: ['forecast'],
                guid: link,
                id: link,
                image: 'http://www.12379.cn/html/new2018/img/logo.png',
                content: { text: alertItem.description, html: htmlContent },
                updated: alertItem.ctime,
                language: 'zh-CN',
            };
        }) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink,
        id: feedLink,
    };
};

export const route: Route = {
    path: '/alert/:filter',
    name: '预警动态',
    parameters: {
        filter: '预警信息筛选词。建议填写自己所在的市、区或县名。如有多个筛选词，可用小写逗号 `,` 隔开。',
    },
    description: `国家突发事件预警信息动态。
因动态内容更新频繁，为避免消息轰炸而过载，需在 \`filter\` 参数加筛选词，仅收录包含筛选词的内容。 \\
你可以在筛选词中写上自己所在的省、市、区或县地名，并用小写逗号隔开。    \\
例如，你希望关注重庆市的沙坪坝区所有预警信息，路径可以写为 \`/12379/alert/重庆,沙坪坝\`   \\
地名只写短称即可，**不要带上省市区乡镇后缀**。  \\
例如，“广西壮族自治区”可写为“广西”；“木里藏族自治县”可写为“木里”；“管城回族区”可写为“管城”；“七里坪乡”可写为“七里坪”。
`,
    maintainers: ['PrinOrange'],
    handler,
    categories: ['forecast'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            title: '预警信息动态',
            source: ['www.12379.cn/html/new2018/more.shtml', 'www.12379.cn/html/new2018/important.shtml', 'www.12379.cn'],
            target: `/alert/:filter`,
        },
    ],
    example: '/alert/重庆,沙坪坝',
};
