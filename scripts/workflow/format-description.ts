import fs from 'node:fs/promises';
import path from 'node:path';

import stringWidth from 'fast-string-width';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkPangu from 'remark-pangu';
import typescript from 'typescript';

const __dirname = import.meta.dirname;
const routesDir = path.resolve(__dirname, '../../lib/routes');

function remarkDirectiveSpace() {
    return (tree: any) => {
        walkDirectiveAst(tree);
    };
}

function walkDirectiveAst(node: any): void {
    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value.replaceAll(/^:::([A-Za-z][\w-]*)/gm, '::: $1');
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

function getPropertyName(name: typescript.PropertyName): string {
    if (typescript.isIdentifier(name) || typescript.isPrivateIdentifier(name) || typescript.isStringLiteral(name) || typescript.isNoSubstitutionTemplateLiteral(name)) {
        return name.text;
    }
    return '';
}

const TARGETS: Record<string, string> = { route: 'Route', namespace: 'Namespace' };

function isTargetTypedDeclaration(decl: typescript.VariableDeclaration): boolean {
    if (!typescript.isIdentifier(decl.name)) {
        return false;
    }
    const expectedType = TARGETS[decl.name.text];
    if (!expectedType) {
        return false;
    }
    if (decl.type && typescript.isTypeReferenceNode(decl.type)) {
        const typeName = decl.type.typeName;
        if (typescript.isIdentifier(typeName) && typeName.text === expectedType) {
            return true;
        }
    }
    return false;
}

function collectDescriptionEdits(sourceFile: typescript.SourceFile): DescriptionEdit[] {
    const edits: DescriptionEdit[] = [];

    const visitObject = (obj: typescript.ObjectLiteralExpression) => {
        for (const prop of obj.properties) {
            if (!typescript.isPropertyAssignment(prop)) {
                continue;
            }
            const name = getPropertyName(prop.name);
            if (name === 'description') {
                const init = prop.initializer;
                if (typescript.isStringLiteral(init) || typescript.isNoSubstitutionTemplateLiteral(init)) {
                    edits.push({
                        start: init.getStart(sourceFile),
                        end: init.getEnd(),
                        raw: init.text,
                    });
                }
            } else if ((name === 'ja' || name === 'zh' || name === 'zh-TW') && typescript.isObjectLiteralExpression(prop.initializer)) {
                visitObject(prop.initializer);
            }
        }
    };

    for (const stmt of sourceFile.statements) {
        if (!typescript.isVariableStatement(stmt)) {
            continue;
        }
        const isExported = stmt.modifiers?.some((m) => m.kind === typescript.SyntaxKind.ExportKeyword);
        if (!isExported) {
            continue;
        }
        for (const decl of stmt.declarationList.declarations) {
            if (!isTargetTypedDeclaration(decl)) {
                continue;
            }
            if (decl.initializer && typescript.isObjectLiteralExpression(decl.initializer)) {
                visitObject(decl.initializer);
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

    const sourceFile = typescript.createSourceFile(filePath, sourceText, typescript.ScriptTarget.Latest, false, filePath.endsWith('.tsx') ? typescript.ScriptKind.TSX : typescript.ScriptKind.TS);

    const edits = collectDescriptionEdits(sourceFile);
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
