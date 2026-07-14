import fs from 'node:fs/promises';
import path from 'node:path';

import stringWidth from 'fast-string-width';
import { type ObjectExpression, parse, type Program, type VariableDeclarator } from 'oxc-parser';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkPangu from 'remark-pangu';

const __dirname = import.meta.dirname;
const routesDir = path.resolve(__dirname, '../../lib/routes');

function remarkDirectiveSpace() {
    return (tree: any) => {
        walkDirectiveAst(tree);
    };
}

function walkDirectiveAst(node: any): void {
    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value.replaceAll(/^:::([A-Z][\w-]*)/gim, '::: $1');
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            walkDirectiveAst(child);
        }
    }
}

// Without remark-directive, a `:::` line right after a list/table gets absorbed:
// lists swallow it as lazy continuation, GFM tables consume it as another row.
// Lift trailing `:::` out so it stringifies flush left.
function shouldLiftFromList(list: any): boolean {
    const lastItem = list.children?.at(-1);
    if (lastItem?.type !== 'listItem') {
        return false;
    }
    const lastPara = lastItem.children?.at(-1);
    if (lastPara?.type !== 'paragraph') {
        return false;
    }
    const lastText = lastPara.children?.at(-1);
    if (lastText?.type !== 'text') {
        return false;
    }
    return (lastText.value as string).trimEnd().endsWith('\n:::');
}

function liftFromList(list: any): void {
    const lastItem = list.children.at(-1);
    const lastPara = lastItem.children.at(-1);
    const lastText = lastPara.children.at(-1);
    lastText.value = (lastText.value as string).trimEnd().slice(0, -4);
    if (lastText.value === '') {
        lastPara.children.pop();
    }
    if (lastPara.children.length === 0) {
        lastItem.children.pop();
    }
}

function shouldLiftFromTable(table: any): boolean {
    const lastRow = table.children?.at(-1);
    if (lastRow?.type !== 'tableRow') {
        return false;
    }
    const cells = lastRow.children;
    if (!Array.isArray(cells) || cells.length === 0) {
        return false;
    }
    const firstCell = cells[0];
    if (firstCell?.type !== 'tableCell' || firstCell.children?.length !== 1) {
        return false;
    }
    const text = firstCell.children[0];
    if (text?.type !== 'text' || text.value !== ':::') {
        return false;
    }
    for (let j = 1; j < cells.length; j++) {
        if (cells[j]?.type !== 'tableCell' || cells[j].children?.length !== 0) {
            return false;
        }
    }
    return true;
}

function visitForLift(parent: any): void {
    if (!Array.isArray(parent.children)) {
        return;
    }
    for (const child of parent.children) {
        visitForLift(child);
    }
    for (let i = parent.children.length - 1; i >= 0; i--) {
        const node = parent.children[i];
        let lifted = false;
        if (node.type === 'list' && shouldLiftFromList(node)) {
            liftFromList(node);
            lifted = true;
        } else if (node.type === 'table' && shouldLiftFromTable(node)) {
            node.children.pop();
            lifted = true;
        }
        if (lifted) {
            parent.children.splice(i + 1, 0, {
                type: 'paragraph',
                children: [{ type: 'text', value: ':::' }],
            });
        }
    }
}

function remarkLiftClosingDirective() {
    return (tree: any) => visitForLift(tree);
}

const processor = remark()
    .data('settings', {
        bullet: '-',
    })
    .use(remarkDirectiveSpace)
    .use(remarkLiftClosingDirective)
    .use(remarkPangu)
    .use(remarkGfm, {
        stringLength: stringWidth,
    });

interface DescriptionEdit {
    start: number;
    end: number;
    raw: string;
}

function getPropertyName(prop: ObjectExpression['properties'][number]): string {
    if (prop.type !== 'Property' || prop.computed) {
        return '';
    }
    if (prop.key.type === 'Identifier') {
        return prop.key.name;
    }
    if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
        return prop.key.value;
    }
    return '';
}

const TARGETS: Record<string, string> = { route: 'Route', namespace: 'Namespace' };

function isTargetTypedDeclaration(decl: VariableDeclarator): boolean {
    if (decl.id.type !== 'Identifier') {
        return false;
    }
    const expectedType = TARGETS[decl.id.name];
    if (!expectedType) {
        return false;
    }
    const typeAnnotation = decl.id.typeAnnotation?.typeAnnotation;
    return typeAnnotation?.type === 'TSTypeReference' && typeAnnotation.typeName.type === 'Identifier' && typeAnnotation.typeName.name === expectedType;
}

function collectDescriptionEdits(program: Program): DescriptionEdit[] {
    const edits: DescriptionEdit[] = [];

    const visitObject = (obj: ObjectExpression) => {
        for (const prop of obj.properties) {
            if (prop.type !== 'Property') {
                continue;
            }
            const name = getPropertyName(prop);
            const init = prop.value;
            if (name === 'description') {
                if (init.type === 'Literal' && typeof init.value === 'string') {
                    edits.push({
                        start: init.start,
                        end: init.end,
                        raw: init.value,
                    });
                } else if (init.type === 'TemplateLiteral' && init.expressions.length === 0 && typeof init.quasis[0]?.value.cooked === 'string') {
                    edits.push({
                        start: init.start,
                        end: init.end,
                        raw: init.quasis[0].value.cooked,
                    });
                }
            } else if ((name.includes('ja') || name.includes('zh')) && init.type === 'ObjectExpression') {
                visitObject(init);
            }
        }
    };

    for (const stmt of program.body) {
        if (stmt.type !== 'ExportNamedDeclaration' || stmt.declaration?.type !== 'VariableDeclaration') {
            continue;
        }
        for (const decl of stmt.declaration.declarations) {
            if (isTargetTypedDeclaration(decl) && decl.init?.type === 'ObjectExpression') {
                visitObject(decl.init);
            }
        }
    }

    return edits;
}

function escapeTemplateLiteral(s: string): string {
    return s
        .replaceAll('\\', String.raw`\\`)
        .replaceAll('`', '\\`')
        .replaceAll('${', '\\${');
}

async function* walk(dir: string): AsyncGenerator<string> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* walk(full);
        } else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
            yield full;
        }
    }
}

async function processFile(filePath: string): Promise<void> {
    const sourceText = await fs.readFile(filePath, 'utf8');
    if (!sourceText.includes('description')) {
        return;
    }

    const { program } = await parse(filePath, sourceText);

    const edits = collectDescriptionEdits(program);
    if (edits.length === 0) {
        return;
    }

    edits.sort((a, b) => b.start - a.start);

    let result = sourceText;
    let changed = false;

    const formattedResults = await Promise.all(
        edits.map(async (edit) => {
            if (!edit.raw.trim()) {
                return { edit, formatted: null as string | null };
            }
            const file = await processor.process(edit.raw);
            return {
                edit,
                formatted: String(file).replace(/\n+$/, ''),
            };
        })
    );

    for (const { edit, formatted } of formattedResults) {
        if (!formatted || formatted === edit.raw) {
            continue;
        }

        const replacement = '`' + escapeTemplateLiteral(formatted) + '`'; // oxlint handles unncessary single line template literals.
        result = result.slice(0, edit.start) + replacement + result.slice(edit.end);
        changed = true;
    }

    if (changed) {
        await fs.writeFile(filePath, result, 'utf8');
    }
}

function isRouteFile(filePath: string): boolean {
    const abs = path.resolve(filePath);
    if (!abs.startsWith(routesDir + path.sep)) {
        return false;
    }
    const base = path.basename(abs);
    return /\.tsx?$/.test(base) && !base.endsWith('.d.ts');
}

async function main() {
    const started = performance.now();
    const args = process.argv.slice(2);
    const files: string[] =
        args.length > 0
            ? args.map((f) => path.resolve(f)).filter((f) => isRouteFile(f))
            : // @ts-ignore ts(2550)
              await Array.fromAsync(walk(routesDir));

    await Promise.all(files.map((f) => processFile(f)));

    // oxlint-disable-next-line no-console
    console.log(`Finished in ${Math.round(performance.now() - started)}ms on ${files.length} files.`);
}

await main();
