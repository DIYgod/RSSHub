import { load } from 'cheerio';
import type { Node } from 'oxc-parser';

import { evaluateScriptData } from '@/utils/evaluate-script';
import { parseScriptSource } from '@/utils/parse-js';

export type Notice = {
    '1': { value: string };
    '6'?: { value: string };
    id: number;
    title: string;
    publishTime?: string;
    dataUrl: string;
    url: string;
    author?: string;
};

type NoticeData = {
    datas: Notice[];
    generalDataTypes: Array<{ name: string; engineInstanceId: number }>;
};

const getProperty = (node: Node | undefined, name: string): Node | undefined => {
    if (node?.type !== 'ObjectExpression') {
        return undefined;
    }
    const property = node.properties.find(
        (property) => property.type === 'Property' && !property.computed && ((property.key.type === 'Literal' && property.key.value === name) || (property.key.type === 'Identifier' && property.key.name === name))
    );
    return property?.type === 'Property' ? property.value : undefined;
};

const isNode = (value: unknown): value is Node => typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string';

const getChildren = (node: Node): Node[] =>
    Object.entries(node).flatMap(([key, value]) => {
        if (key === 'parent') {
            return [];
        }
        return (Array.isArray(value) ? value : [value]).filter((child) => isNode(child));
    });

const getLiteralValue = (node: Node | undefined, bindings: Map<string, Node>) => {
    const value = node?.type === 'Identifier' ? bindings.get(node.name) : node;
    return value?.type === 'Literal' ? value.value : undefined;
};

export const getPreviewUrl = async (html: string, baseUrl: string) => {
    const $ = load(html);
    const source = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => /\b(?:var|let|const)\s+previewUrl\s*=/.test(source));
    if (!source) {
        throw new Error('The ECUST continuing education homepage no longer provides its public preview URL.');
    }
    const { program, errors } = await parseScriptSource(source);
    const declaration = program.body
        .filter((statement) => statement.type === 'VariableDeclaration')
        .flatMap((statement) => statement.declarations)
        .find((declaration) => declaration.id.type === 'Identifier' && declaration.id.name === 'previewUrl');
    if (errors.length || !declaration?.init) {
        throw new Error('The ECUST continuing education homepage no longer provides its public preview URL.');
    }
    const previewUrl = await evaluateScriptData<string>(`var previewUrl=${source.slice(declaration.init.start, declaration.init.end)};`, 'previewUrl');
    if (previewUrl) {
        return new URL(previewUrl, baseUrl).href;
    }
    throw new Error('The ECUST continuing education homepage no longer provides its public preview URL.');
};

export const getNotices = async (html: string) => {
    const $ = load(html);
    const source = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => source.includes('window.__NUXT__'));
    if (!source) {
        throw new Error('The ECUST continuing education page did not provide its public notice data.');
    }
    const { program, errors } = await parseScriptSource(source);
    const assignment = program.body.find(
        (statement) =>
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'AssignmentExpression' &&
            statement.expression.left.type === 'MemberExpression' &&
            statement.expression.left.object.type === 'Identifier' &&
            statement.expression.left.object.name === 'window' &&
            statement.expression.left.property.type === 'Identifier' &&
            statement.expression.left.property.name === '__NUXT__'
    );
    const call = assignment?.type === 'ExpressionStatement' && assignment.expression.type === 'AssignmentExpression' ? assignment.expression.right : undefined;
    if (errors.length || call?.type !== 'CallExpression' || call.callee.type !== 'FunctionExpression' || !call.callee.body || call.callee.params.some((parameter) => parameter.type !== 'Identifier')) {
        throw new Error('The ECUST public notice data format has changed.');
    }
    const bindings = new Map<string, Node>(call.callee.params.map((parameter, index) => [parameter.type === 'Identifier' ? parameter.name : '', call.arguments[index]]));
    const noticeEngineIds = new Set<number>();
    const dataNodes: Node[] = [];
    const pending: Node[] = [call.callee.body];
    while (pending.length) {
        const node = pending.pop()!;
        if (node.type === 'ObjectExpression') {
            const engineId = getLiteralValue(getProperty(node, 'engineInstanceId_10'), bindings);
            if (getLiteralValue(getProperty(node, 'name'), bindings) === '通知公告' && typeof engineId === 'number') {
                noticeEngineIds.add(engineId);
            }
            if (getProperty(node, 'datas')?.type === 'ArrayExpression' && getProperty(node, 'generalDataTypes')?.type === 'ArrayExpression') {
                dataNodes.push(node);
            }
        }
        pending.push(...getChildren(node));
    }
    const matches = dataNodes.filter((node) => {
        const types = getProperty(node, 'generalDataTypes');
        return (
            types?.type === 'ArrayExpression' &&
            types.elements.some((type) => {
                const engineId = getLiteralValue(getProperty(type ?? undefined, 'engineInstanceId'), bindings);
                return getLiteralValue(getProperty(type ?? undefined, 'name'), bindings) === '通知公告' && typeof engineId === 'number' && noticeEngineIds.has(engineId);
            })
        );
    });
    if (noticeEngineIds.size !== 1 || matches.length !== 1) {
        throw new Error('The ECUST page did not identify a unique continuing education notice list.');
    }

    // Parse only the notice payload and its literal bindings, avoiding the unrelated page layouts.
    const references = new Set<string>();
    pending.push(matches[0]);
    while (pending.length) {
        const node = pending.pop()!;
        if (node.type === 'Identifier' && bindings.has(node.name)) {
            references.add(node.name);
        }
        pending.push(...getChildren(node));
    }
    const declarations = [...references].map((name) => {
        const value = bindings.get(name)!;
        return `${name}=${source.slice(value.start, value.end)}`;
    });
    const data = await evaluateScriptData<NoticeData>(`var ${declarations.join(',')};var notices=${source.slice(matches[0].start, matches[0].end)};`, 'notices');
    return { list: data.datas, engineInstanceId: [...noticeEngineIds][0] };
};
