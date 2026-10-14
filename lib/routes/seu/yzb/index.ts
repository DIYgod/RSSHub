import { load } from 'cheerio';
import { encodeHTML } from 'entities';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yzb/:type',
    categories: ['university'],
    example: '/seu/yzb/6676',
    parameters: { type: '分类名，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['yzb.seu.edu.cn/:type/list.htm'],
        },
    ],
    name: '研究生招生网通知公告',
    maintainers: ['fuzy112'],
    handler,
    description: `| 硕士招生 | 博士招生 | 港澳台及中外合作办学 |
| -------- | -------- | -------------------- |
| 6676     | 6677     | 6679                 |`,
};

interface CatalogCollege {
    yxsh: string;
    yxmc: string;
    yxjj: string;
    tel: string;
    tkrs: string;
    yxbz: string;
    exportZsmlYxZys: Array<{
        zydm: string;
        zymc: string;
        xwlb: string;
        zydmlb: string;
        zyjs: string;
        kskm: string;
        jsfskskm: string;
        zybz: string;
        exportZsmlYxZyYjfxs: Array<{ fxm: string; fxmc: string; xxfs: string; yjfxbz: string }>;
    }>;
}

function catalogJson<T>(script: string, name: string): T {
    const declaration = new RegExp(`var\\s+${name}\\s*=\\s*`).exec(script);
    if (!declaration) {
        throw new Error(`The admissions catalog no longer provides ${name}.`);
    }
    const start = declaration.index + declaration[0].length;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < script.length; index++) {
        const character = script[index];
        if (quoted) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                quoted = false;
            }
        } else {
            switch (character) {
                case '"':
                    quoted = true;

                    break;

                case '{':
                case '[':
                    depth++;

                    break;

                case '}':
                case ']':
                    depth--;
                    if (depth === 0) {
                        return JSON.parse(script.slice(start, index + 1));
                    }

                    break;

                default:
                // Do nothing
            }
        }
    }
    throw new Error(`The admissions catalog contains incomplete ${name} data.`);
}

async function catalogDescription(link: string, page: string) {
    const scriptPath = /src=['"]([^'"]*\/data\.js)/.exec(page)?.[1];
    if (!scriptPath) {
        return;
    }
    const { data: script } = await got(new URL(scriptPath, link).href);
    const tree = catalogJson<{ items: Array<{ value: string }> }>(script, 'treeData');
    const catalog = catalogJson<{ mllb: string }>(script, 'zsml');
    const colleges = catalogJson<Record<string, CatalogCollege[]>>(script, 'mainData');
    // The source selects the first department on initial page load.
    const college = colleges[`mllb_${catalog.mllb}`]?.find((entry) => entry.yxsh === tree.items[0]?.value);
    if (!college) {
        throw new Error('The admissions catalog has no data for its default department.');
    }
    const rows = college.exportZsmlYxZys
        .map((program) => {
            const directions = program.exportZsmlYxZyYjfxs
                .map((direction) => `<li>${encodeHTML(direction.fxm)}${direction.xxfs === '1' ? '（全日制）' : direction.xxfs === '2' ? '（非全日制）' : ''}${direction.fxmc}${encodeHTML(direction.yjfxbz)}</li>`)
                .join('');
            const degree = program.xwlb === '1' ? '（学术学位）' : program.xwlb === '2' ? '（专业学位）' : '';
            const exams = program.kskm
                .replace('①1100外国语', '')
                .replace('②2200专业基础', '')
                .replace('③3300专业课', '')
                .replace('①188只招收推免生', '')
                .replace('②266只招收推免生', '')
                .replace('③799只招收推免生', '')
                .replace('④899只招收推免生', '')
                .replace('03、04方向：<br>', '');
            return `<tr><td><h3>${encodeHTML(program.zydm)}${degree}${program.zydmlb === '2' ? '★' : ''}${encodeHTML(program.zymc)}</h3>${program.zyjs}<ul>${directions}</ul></td><td>${exams}</td><td>${program.jsfskskm}</td><td>${encodeHTML(program.zybz).replaceAll('\n', '<br>')}</td></tr>`;
        })
        .join('');
    return `<h2>${encodeHTML(college.yxsh)} ${encodeHTML(college.yxmc)}</h2>${college.yxjj}<p>电话：${encodeHTML(college.tel)}</p><p>招生计划：${encodeHTML(college.tkrs)}</p><p>${encodeHTML(college.yxbz)}</p><table><thead><tr><th>专业代码、名称及研究方向</th><th>初试科目</th><th>复试、同等学力加试科目</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function handler(ctx) {
    const host = 'https://yzb.seu.edu.cn';

    const map = {
        6676: { id: 1 },
        6677: { id: 2 },
        6679: { id: 3 },
    };

    const type = ctx.req.param('type');
    const id = type.length === 1 ? Object.keys(map).find((key) => map[key].id === Number.parseInt(type)) : Number.parseInt(type); // backward compatible
    const url = new URL(`${id}/list.htm`, host).href;

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('#wp_news_w3 td tbody tr')
        .toArray()
        .map((elem): DataItem => {
            const $elem = $(elem);
            const a = $elem.find('td a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, host).href,
                pubDate: $elem.find('td div').text() ? parseDate(`${$elem.find('td div').text()}T00:00:00+08:00`) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const catalog = new URL(item.link!).hostname === 'gsas.seu.edu.cn';
            try {
                const detail = await cache.tryGet(item.link!, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    return {
                        description: catalog ? await catalogDescription(item.link!, response) : $('.Article_Content').html(),
                    };
                });
                return { ...item, ...detail };
            } catch (error) {
                if (catalog && error instanceof FetchError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        link: url,
        title: `东南大学研究生招生网 -- ${$('head title').text()}`,
        item: items,
    };
}
