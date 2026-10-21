import type { CheerioAPI } from 'cheerio';
import type { Node } from 'oxc-parser';

import { parseDate } from '@/utils/parse-date';
import { parseScriptSource } from '@/utils/parse-js';
import { fixArticleContent } from '@/utils/wechat-mp';

const getProperty = (node: Node | undefined, name: string): Node | undefined => {
    if (node?.type !== 'ObjectExpression') {
        return undefined;
    }
    const property = node.properties.find(
        (property) => property.type === 'Property' && !property.computed && ((property.key.type === 'Identifier' && property.key.name === name) || (property.key.type === 'Literal' && property.key.value === name))
    );
    return property?.type === 'Property' ? property.value : undefined;
};

const getString = (node: Node | undefined): string | undefined => {
    const value = node?.type === 'LogicalExpression' && node.operator === '||' ? node.left : node;
    return value?.type === 'Literal' && typeof value.value === 'string' ? value.value : undefined;
};

const getCreateTimes = (node: Node): string[] => {
    switch (node.type) {
        case 'Program':
        case 'BlockStatement':
            return node.body.flatMap(getCreateTimes);

        case 'VariableDeclaration':
            return node.declarations.flatMap((declaration) => {
                if (declaration.id.type === 'Identifier' && declaration.id.name === 'oriCreateTime') {
                    const value = getString(declaration.init ?? undefined);
                    return value && /^\d+$/.test(value) ? value : [];
                }
                return declaration.init?.type === 'CallExpression' ? getCreateTimes(declaration.init) : [];
            });

        case 'IfStatement':
            return [...getCreateTimes(node.consequent), ...(node.alternate ? getCreateTimes(node.alternate) : [])];

        case 'CallExpression':
            return getCreateTimes(node.callee);

        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            return node.body ? getCreateTimes(node.body) : [];

        default:
            return [];
    }
};

export const getArticlePubDate = async ($: CheerioAPI): Promise<Date | undefined> => {
    const source = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => /\bvar\s+oriCreateTime\s*=/.test(source));
    if (!source) {
        return undefined;
    }
    const { program, errors } = await parseScriptSource(source);
    if (errors.length) {
        return undefined;
    }
    const values = [...new Set(getCreateTimes(program))];
    if (values.length !== 1) {
        return undefined;
    }
    const timestamp = Number(values[0]);
    if (!Number.isSafeInteger(timestamp)) {
        return undefined;
    }
    const date = parseDate(timestamp * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

const getVideoUrl = (node: Node | undefined, articleUrl: string): string | undefined => {
    if (node?.type !== 'CallExpression' || node.callee.type !== 'MemberExpression' || node.callee.computed || node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'replace') {
        return undefined;
    }
    const value = getString(node.callee.object);
    if (!value) {
        return undefined;
    }
    // Read the serialized URL without executing the page's JavaScript.
    const protocol = new URL(articleUrl).protocol;
    const url = new URL(value.replaceAll('&amp;', '&').replace(/^http(s?):/, () => protocol));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
};

export const getArticleContent = async ($: CheerioAPI, articleUrl: string): Promise<string | undefined> => {
    const content = $('#js_content');
    if (!content.length) {
        return undefined;
    }
    const source = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => /\bvar\s+videoPageInfos\s*=/.test(source));
    if (source) {
        const { program, errors } = await parseScriptSource(source);
        const declaration = program.body
            .filter((statement) => statement.type === 'VariableDeclaration')
            .flatMap((statement) => statement.declarations)
            .find((declaration) => declaration.id.type === 'Identifier' && declaration.id.name === 'videoPageInfos');
        if (!errors.length && declaration?.init?.type === 'ArrayExpression') {
            for (const item of declaration.init.elements) {
                const videoId = getString(getProperty(item ?? undefined, 'video_id'));
                const variants = getProperty(item ?? undefined, 'mp_video_trans_info');
                if (!videoId || variants?.type !== 'ArrayExpression') {
                    continue;
                }
                const url = variants.elements.map((variant) => getVideoUrl(getProperty(variant ?? undefined, 'url'), articleUrl)).find(Boolean);
                if (!url) {
                    continue;
                }
                const poster = getString(getProperty(item ?? undefined, 'cover_url'));
                content.find('iframe[data-mpvid]').each((_, element) => {
                    const iframe = $(element);
                    if (iframe.attr('data-mpvid') !== videoId) {
                        return;
                    }
                    const video = $('<video>').attr('src', url).attr('controls', '').attr('style', 'width:100%');
                    if (poster) {
                        video.attr('poster', poster);
                    }
                    iframe.replaceWith(video);
                });
            }
        }
    }
    return fixArticleContent(content);
};
