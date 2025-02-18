import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import puppeteer from '@/utils/puppeteer';
import markdownit from 'markdown-it';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

const md = markdownit({
    html: false,
    breaks: true,
    linkify: true,
});

export const route: Route = {
    path: '/aistudio/:category/:tag?',
    categories: ['programming'],
    example: '/baidu/aistudio/project',
    parameters: {
        category: '分类',
        tag: '不同标签',
    },
    description: `TIP
| **Title**                                | **Route**                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| 飞桨AI Studio星河社区 - 精选应用         | /baidu/aistudio/application/app  |
| 飞桨AI Studio星河社区 - 工具中心         | /baidu/aistudio/application/tool |
| 飞桨AI Studio星河社区 - 数据集           | /baidu/aistudio/dataset          |
| 飞桨AI Studio星河社区 - 每周热门精选项目 | /baidu/aistudio/recommend/weekly |
| 飞桨AI Studio星河社区 - 项目大厅综合推荐 | /baidu/aistudio/project          |
| 飞桨AI Studio星河社区 - 百度推荐学习项目 | /baidu/aistudio/recommend/study  |
| 飞桨AI Studio星河社区 - 模型库           | /baidu/aistudio/model            |
| 飞桨AI Studio星河社区 - 特色专区         | /baidu/aistudio/explore          |
    `,
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
            source: ['aistudio.baidu.com/:category/:tag?'],
            target: '/aistudio/:category/:tag?',
            title: '飞桨AI Studio星河社区',
        },
    ],
    name: '飞桨AI Studio星河社区',
    maintainers: ['orzchen'],
    handler,
};

async function handler(ctx) {
    const { category, tag } = ctx.req.param();
    // 组建API url
    const baseApi = 'https://aistudio.baidu.com';
    const apiList = {
        project: {
            title: '项目大厅综合推荐',
            link: '/projectoverview',
            path: '/studio/project/public/list',
            method: 'POST',
            type: 'application/json',
            data: { p: 1, pageSize: 10, topic: 0, category: 0, tags: [], order: 0, kw: null, type: 0 },
            params: {},
            result: 'result.data',
            item: {
                info: true,
                link: '/projectdetail/',
                descId: 'projectId',
                descType: 'ipynb',
                descApi: [`${baseApi}/studio/ipynb/content`],
                method: 'POST',
                type: 'application/x-www-form-urlencoded',
                data: { projectId: '$.projectId' },
                params: {},
                result: '$.result',
                title: 'projectName',
                date: 'updateTime',
            },
        },
        application: {
            app: {
                title: '应用中心',
                link: '/application/center/app',
                path: '/studio/project/serving/v2/list',
                method: 'GET',
                type: '',
                data: {},
                params: { pageNo: 1, pageSize: 24, tagIdList: 156 },
                result: 'result.data',
                item: {
                    info: false,
                    title: 'appNameNew',
                    link: '/application/detail/',
                    descId: 'appId',
                    date: 'createTime',
                    desc: 'appAbs',
                    img: 'imageUrl',
                },
            },
            tool: {
                title: '工具中心',
                link: '/application/center/tool',
                path: '/llm/lmapp/tools/public/list',
                method: 'GET',
                type: '',
                data: {},
                params: { pageNum: 1, pageSize: 10, sortType: 0, tag: 0 },
                result: 'result.data',
                item: {
                    info: true,
                    link: '/application/center/tool',
                    descId: '',
                    descType: 'yaml',
                    descApi: [`${baseApi}/llm/lmapp/tools/`, '$.toolId', '/detail'],
                    method: 'GET',
                    type: '',
                    data: {},
                    params: { versionId: '$.latestVersionId' },
                    result: 'result',
                    title: 'name',
                    date: 'updateTime',
                },
            },
        },
        model: {
            title: '模型库',
            link: '/modelsoverview',
            path: '/modelcenter/v2/models/search',
            method: 'POST',
            type: 'application/json',
            data: {
                category: '',
                task: '',
                example: '',
                publisher: '',
                dataset: '',
                hardware: '',
                os: '',
                sortBy: 'weight',
                supportPaddlex: 0,
                ifOnlineDemo: 0,
                ifTraining: 0,
                supportDeploy: 0,
                q: '',
                pageSize: 12,
                pageNo: 1,
            }, // POST 请求的数据
            params: {},
            result: 'result.data',
            item: {
                info: true,
                link: '/modelsdetail/',
                descId: '$.modelId',
                descType: '$.params.fileName',
                descApi: [`${baseApi}/modelcenter/v2/models/content`],
                method: 'GET',
                type: '',
                data: {},
                params: {
                    fileName: {
                        isRequest: true,
                        method: 'GET',
                        api: [`${baseApi}/modelcenter/v2/models/detail/`, '$.modelId'],
                        params: {},
                        data: {},
                        type: '',
                        result: '$.result.modelIntro',
                    },
                    id: '$.modelId',
                    ref: 'master',
                },
                result: '$.result',
                title: '$.modelName',
                date: '$.updateTime',
            },
        },
        dataset: {
            title: '数据集',
            link: '/datasetoverview',
            path: '/studio/dataset/publiclist',
            method: 'POST',
            type: 'application/json', // 请求格式
            data: { tags: [], kw: '', orderType: 0, topic: 0, p: 1, pageSize: 10 },
            params: {},
            result: '$.result.data',
            item: {
                info: false,
                title: '$.datasetName',
                link: '/datasetdetail/',
                descId: '$.datasetId',
                date: '$.createTime',
                desc: '$.datasetAbs',
                img: '$.portrait',
            },
        },
        activity: {
            title: '活动中心',
            link: '/activityoverview',
            path: '/studio/huodong/public/list',
            method: 'GET',
            type: '',
            data: {},
            params: {
                huodongStatus: 3,
                huodongType: 0,
                keyword: '',
                pageNo: 1,
                pageSize: 10,
                tags: '',
            },
            result: '$.result.data',
            item: {
                info: false,
                title: '$.huodongName',
                link: '/activitydetail/',
                descId: '$.huodongId',
                date: '$.startTime',
                desc: '$.shortDesc',
                img: '$.thumbUrl',
            },
        },
        explore: {
            title: '特色专区',
            link: '/explore/topics',
            path: '/studio/gallery/materials',
            method: 'GET',
            type: '',
            data: {},
            params: {
                galleryKeys: 'index_paddle_zone_material', // index_paddle_zone_material,index_paddle_zone
            },
            result: '$.result[?(@galleryKey = index_paddle_zone_material)].$[0].materials',
            item: {
                info: false,
                title: '$.title',
                link: '',
                descId: '$.jumpUrl',
                date: null,
                desc: '$.desc',
                img: '$.pic',
            },
        },
        recommend: {
            weekly: {
                method: 'GET',
                path: '/studio/user/recommend',
                params: {},
                data: {},
                result: 'result[?(@recommendType = 3)].$[0].data',
                title: '每周热门精选项目',
                link: '/projectoverview',
                item: {
                    info: true,
                    descType: 'ipynb',
                    link: '/projectdetail/',
                    descId: 'entityId',
                    descApi: [`${baseApi}/studio/ipynb/content`],
                    method: 'POST',
                    type: 'application/x-www-form-urlencoded',
                    data: { projectId: '$.entityId' },
                    params: {},
                    title: 'entityName',
                    date: 'updateTime',
                    result: '$.result',
                },
            },
            study: {
                method: 'GET',
                path: '/studio/user/recommend',
                params: {},
                result: 'result[?(@recommendType = 4)].$[0].data',
                title: '百度推荐学习项目',
                link: '/projectoverview',
                item: {
                    info: true,
                    descType: 'ipynb',
                    link: '/projectdetail/',
                    descApi: [`${baseApi}/studio/ipynb/content`],
                    method: 'POST',
                    data: { projectId: '$.entityId' },
                    type: 'application/x-www-form-urlencoded',
                    title: 'entityName',
                    descId: 'entityId',
                    date: 'updateTime',
                    result: '$.result',
                },
            },
        },
    };

    const api = tag ? apiList[category][tag] : apiList[category];
    const apiUrl = `${baseApi}${api.path}`;

    const response = await ofetchM(apiUrl, api);
    const data = jp(response, api.result);

    const list = await Promise.all(
        data.map(async (item) => {
            const title = jp(item, api.item.title);
            const descId = jp(item, api.item.descId);
            const link = typeof descId === 'string' && descId.startsWith('http') ? descId : `${baseApi}${api.item.link}${jp(item, api.item.descId)}`;
            const pubDate = api.item.date === null ? '' : timezone(parseDate(jp(item, api.item.date)), +8);
            const desc = structuredClone(api.item);
            if (api.item.info) {
                desc.descApi = realDescAPI(desc.descApi, item);
                await traverseIterative(desc.data, item);
                await traverseIterative(desc.params, item);
            } else {
                desc.data = `${jp(item, api.item.desc)}<br><img src="${jp(item, api.item.img)}" alt="">`;
            }
            return {
                title,
                link,
                desc,
                pubDate,
            };
        })
    );

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.desc.info) {
                    item.description = item.desc.data;
                    return item;
                }
                const response = await ofetchM(item.desc.descApi, item.desc);
                if (item.desc.descType.startsWith('$')) {
                    const typeList = { md: 'markdown', ipynb: 'ipynb' };
                    const descType = jp(item.desc, item.desc.descType);
                    if (typeof item.desc.descType === 'string') {
                        const [type] = descType.split('.').slice(-1);
                        item.desc.descType = type === undefined ? item.desc.descType : typeList[type];
                    }
                }

                switch (item.desc.descType) {
                    case 'ipynb':
                        await ipynbAnalysis(response, item);
                        break;
                    case 'yaml':
                        await yamlAnalysis(response, item);
                        break;
                    case 'markdown':
                        await markdownAnalysis(response, item);
                        break;
                    default:
                    // Do nothing
                }
                return item;
            })
        )
    );

    return {
        title: `飞桨AI Studio星河社区 - ${api.title}`,
        link: `${baseApi}${api.link}`,
        item: items,
    };
}

function realDescAPI(originalApi, item) {
    const realDescApi: string[] = [];
    for (let a of originalApi) {
        if (a.startsWith('$')) {
            a = jp(item, a);
        }
        realDescApi.push(a);
    }
    return realDescApi.join('');
}

async function traverseIterative(obj, item) {
    const stack = [obj];
    const promises: any[] = [];
    while (stack.length > 0) {
        const current = stack.pop();

        for (const key in current) {
            if (typeof current[key] === 'object' && current[key] !== null) {
                if (current[key].isRequest) {
                    promises.push(
                        ofetchM(realDescAPI(current[key].api, item), current[key]).then((result) => {
                            current[key] = jp(result, current[key].result);
                        })
                    );
                } else {
                    stack.push(current[key]);
                }
            } else {
                if (typeof current[key] === 'string' && current[key].startsWith('$')) {
                    current[key] = jp(item, current[key]);
                }
            }
        }
    }
    await Promise.all(promises);
}

async function inlineStylesFromHtml(htmlContent: string) {
    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.setContent(htmlContent);

    await page.evaluate(() => {
        const stylesheets = document.styleSheets;
        const elements = document.querySelectorAll('*');

        for (const element of elements) {
            let inlineStyle = '';

            for (const stylesheet of stylesheets) {
                // const rules = stylesheet.cssRules || stylesheet.rules;
                const rules = stylesheet.cssRules;
                for (const rule of rules) {
                    if (rule instanceof CSSStyleRule && rule.selectorText && element.matches(rule.selectorText)) {
                        inlineStyle += rule.style.cssText;
                    }
                }
            }

            if (inlineStyle) {
                element.setAttribute('style', inlineStyle);
            }
        }
    });

    const renderedHTML = await page.content();
    await page.close();
    await browser.close();
    return renderedHTML;
}

function splitString(input) {
    const pattern = /(\[.*?])/g;
    const parts: string[] = [];
    let lastIndex = 0;

    input.replaceAll(pattern, (match, p1, offset) => {
        if (offset > lastIndex) {
            parts.push(...input.slice(lastIndex, offset).split('.').filter(Boolean));
        }
        parts.push(p1);
        lastIndex = offset + match.length;
    });

    if (lastIndex < input.length) {
        parts.push(...input.slice(lastIndex).split('.').filter(Boolean));
    }

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('[') && parts[i].endsWith(']')) {
            parts[i] = parts[i - 1] + parts[i];
            parts.splice(i - 1, 1);
        }
    }
    return parts;
}

// jsonPathQueryWithFilter
const jp = (obj: any, path: string) => {
    const pathParts: string[] = splitString(path);
    let current = obj;

    // 循环条件
    for (const part of pathParts) {
        // 是否是数组取值
        if (/(\w+|\$)\[(.*)]/.test(part)) {
            const arrayMatch = part.match(/(\w+|\$)\[(\d+)]/);
            if (arrayMatch) {
                const [, word, idx] = arrayMatch;
                current = word === '$' ? current[idx] : current[word][idx];
            } else {
                const filterMatch = part.match(/(\w+|\$)\[\?\(@(.*)\)]/);
                if (filterMatch) {
                    const [, key, filter] = filterMatch;
                    const list = key === '$' ? current : current[key];
                    current = list.filter((item) => {
                        const [key, operator, value] = filter.split(/([><=]+)/).map((e) => e.trim());
                        switch (operator) {
                            case '>':
                                return item[key] > Number.parseFloat(value);
                            case '<':
                                return item[key] < Number.parseFloat(value);
                            case '=':
                                return Number.isNaN(+value) ? item[key] === value : item[key] === Number.parseFloat(value);
                            default:
                            // Do nothing
                        }
                        return false;
                    });
                }
            }
        } else {
            current = part === '$' ? current : current[part];
        }

        if (current === undefined) {
            return;
        }
    }

    return current;
};

const ipynbAnalysis = async (response, item) => {
    const mds: string[] = [];
    const notebook = JSON.parse(jp(response, item.desc.result));
    for (const cell of notebook.cells) {
        if (cell.cell_type === 'markdown') {
            const markdownContent = cell.source.join('');
            mds.push(markdownContent);
        }
        if (cell.cell_type === 'code') {
            const markdownContent = `\n\`\`\`\n${cell.source.join('')}\n\`\`\`\n`;
            mds.push(markdownContent);
        }
    }
    const description = art(path.join(__dirname, 'templates/description.art'), {
        content: md.render(mds.join('')),
    });

    item.description = await inlineStylesFromHtml(description); // 添加内联样式
};

const yamlAnalysis = async (response, item) => {
    const result = jp(response, item.desc.result);
    if (result.yaml !== undefined && result.yaml !== null) {
        result.yaml = Object.entries(result.yaml)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
    }
    const description1 = art(path.join(__dirname, 'templates/application.art'), {
        ...result,
    });
    const description = art(path.join(__dirname, 'templates/description.art'), {
        content: md.render(description1),
    });

    item.description = await inlineStylesFromHtml(description);
};

const markdownAnalysis = async (response, item) => {
    const result = jp(response, item.desc.result);
    const description = art(path.join(__dirname, 'templates/description.art'), {
        content: md.render(result),
    });
    item.description = await inlineStylesFromHtml(description);
};

const ofetchM = async (apiUrl, api) => {
    let body: any;
    let params: any;
    if (api.method === 'POST') {
        if (api.type === 'application/json') {
            body = api.data;
        } else if (api.type === 'application/x-www-form-urlencoded') {
            body = new URLSearchParams(Object.entries(api.data));
        }
    } else if (api.method === 'GET') {
        params = api.params;
    } else {
        throw new Error(`Error Method ${api.method}`);
    }
    return await ofetch(apiUrl, {
        method: api.method,
        body,
        params,
    });
};
