import { type AnyNode, parseExpressionAt } from 'acorn';
import { escape } from 'entities';

export type DigestEntry = {
    title: string;
    judgment: string;
    url: string;
    media?: {
        image: string;
    };
};

export type Edition = {
    editionVersion: number;
    date: string;
    overview: string;
    highlights: string[];
    columns: Record<string, DigestEntry[]>;
};

const columnNames: Record<string, string> = {
    ai: 'AI 资讯',
    collab: 'AI 协作',
    indie: '一人公司',
    marketing: '产品营销',
    product: '产品设计',
    taste: '审美提升',
};
const jsonParseCall = 'JSON.parse(';
const maxScriptLength = 2_000_000;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const readStaticJsonArgument = (source: string, callStart: number): string | undefined => {
    let expression: AnyNode;
    try {
        expression = parseExpressionAt(source, callStart, { ecmaVersion: 'latest' });
    } catch {
        return;
    }

    const call = expression.type === 'SequenceExpression' ? expression.expressions[0] : expression;
    if (
        call.type !== 'CallExpression' ||
        call.callee.type !== 'MemberExpression' ||
        call.callee.computed ||
        call.callee.object.type !== 'Identifier' ||
        call.callee.object.name !== 'JSON' ||
        call.callee.property.type !== 'Identifier' ||
        call.callee.property.name !== 'parse'
    ) {
        return;
    }

    const argument = call.arguments[0];
    if (!argument || argument.type === 'SpreadElement') {
        return;
    }
    if (argument.type === 'Literal' && typeof argument.value === 'string') {
        return argument.value;
    }
    if (argument.type === 'TemplateLiteral' && argument.expressions.length === 0 && argument.quasis.length === 1) {
        return argument.quasis[0].value.cooked ?? undefined;
    }
};

const readString = (record: Record<string, unknown>, key: string, context: string): string => {
    const value = record[key];
    if (typeof value !== 'string' || !value) {
        throw new Error(`Invalid ${context}: ${key} must be a non-empty string`);
    }
    return value;
};

const parseDigestEntry = (value: unknown, context: string): DigestEntry => {
    if (!isRecord(value)) {
        throw new Error(`Invalid ${context}: entry must be an object`);
    }

    const title = readString(value, 'title', context);
    const judgment = readString(value, 'judgment', context);
    const url = readString(value, 'url', context);
    const media = value.media;
    const image = isRecord(media) && typeof media.image === 'string' && media.image ? media.image : undefined;

    return {
        title,
        judgment,
        url,
        ...(image && { media: { image } }),
    };
};

const parseEdition = (value: unknown, index: number): Edition => {
    const context = `edition at index ${index}`;
    if (!isRecord(value)) {
        throw new Error(`Invalid ${context}: edition must be an object`);
    }

    const editionVersion = value.editionVersion;
    if (typeof editionVersion !== 'number') {
        throw new TypeError(`Invalid ${context}: editionVersion must be a number`);
    }

    const date = readString(value, 'date', context);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid ${context}: date must use YYYY-MM-DD format`);
    }

    const overview = readString(value, 'overview', context);
    if (!Array.isArray(value.highlights) || value.highlights.some((highlight) => typeof highlight !== 'string')) {
        throw new Error(`Invalid ${context}: highlights must be an array of strings`);
    }
    if (!isRecord(value.columns)) {
        throw new Error(`Invalid ${context}: columns must be an object`);
    }

    const columns = Object.fromEntries(
        Object.entries(value.columns).map(([columnId, entries]) => {
            if (!Array.isArray(entries)) {
                throw new TypeError(`Invalid ${context}: column ${columnId} must be an array`);
            }
            return [columnId, entries.map((entry, entryIndex) => parseDigestEntry(entry, `${context}, column ${columnId}, entry ${entryIndex}`))];
        })
    );

    return {
        editionVersion,
        date,
        overview,
        highlights: value.highlights,
        columns,
    };
};

const parseEditions = (value: unknown): Edition[] => {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Invalid iandaily data: expected at least one edition');
    }

    const editions = value.map((edition, index) => parseEdition(edition, index)).toSorted((a, b) => b.date.localeCompare(a.date));
    if (new Set(editions.map((edition) => edition.date)).size !== editions.length) {
        throw new Error('Invalid iandaily data: edition dates must be unique');
    }
    return editions;
};

export const parseEditionsFromScript = (source: string): Edition[] => {
    if (source.length > maxScriptLength) {
        throw new Error('Unable to parse iandaily data: application bundle exceeds the size limit');
    }

    let candidateError: unknown;
    let callStart = source.indexOf(jsonParseCall);
    while (callStart !== -1) {
        const serialized = readStaticJsonArgument(source, callStart);
        if (serialized?.includes('"editionVersion"')) {
            try {
                return parseEditions(JSON.parse(serialized));
            } catch (error) {
                candidateError = error;
            }
        }
        callStart = source.indexOf(jsonParseCall, callStart + jsonParseCall.length);
    }

    if (candidateError) {
        throw new Error('Unable to parse iandaily edition data; the data format may have changed', { cause: candidateError });
    }
    throw new Error('Unable to find iandaily edition data; the application bundle may have changed');
};

export const renderEdition = (edition: Edition): string => {
    const highlights = edition.highlights.length ? `<h2>今日看点</h2><ul>${edition.highlights.map((highlight) => `<li>${escape(highlight)}</li>`).join('')}</ul>` : '';
    const columns = Object.entries(edition.columns)
        .map(
            ([columnId, entries]) =>
                `<h2>${escape(columnNames[columnId] ?? columnId)}</h2><ul>${entries.map((entry) => `<li><a href="${escape(entry.url)}"><strong>${escape(entry.title)}</strong></a><br>${escape(entry.judgment)}</li>`).join('')}</ul>`
        )
        .join('');

    return `<p>${escape(edition.overview)}</p>${highlights}${columns}`;
};

export const findEditionImage = (edition: Edition, baseUrl: string): string | undefined => {
    for (const entries of Object.values(edition.columns)) {
        const image = entries.find((entry) => entry.media?.image)?.media?.image;
        if (image) {
            return new URL(image, baseUrl).href;
        }
    }
};

export const getColumnNames = (edition: Edition): string[] => Object.keys(edition.columns).map((columnId) => columnNames[columnId] ?? columnId);
