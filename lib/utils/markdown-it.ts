import type { MarkdownIt as Markdown, StateBlock } from 'markdown-it';
import MarkdownIt from 'markdown-it';

// markdown-it's own limit for the cells it adds to one table. Here it holds for all body cells of a text, written or not:
// each takes three tokens and 1 KB of heap.
const MAX_TABLE_CELLS = 65536;

// What the uses of link references may copy in a text that is shorter than this. A feed renders many texts, and with this
// a short one grows 32 times at most, about as much as one that is full of written table cells.
const MIN_REFERENCE_SIZE = 16384;

/**
 * A body row may leave cells out, and markdown-it adds them: 1.8 KB (148 columns, 442 rows of `|`) give 65416 cells,
 * which take 196000 tokens, 62 MB of heap and 2.4 MB of HTML. The next table does the same.
 *
 * A written cell takes at least a `|`, so all tables of a text together get as many body cells as the text has characters.
 * A table ends where they are used up, and the rows that are left are a paragraph, as they are beyond markdown-it's limit.
 */
const limitTableCells = (md: Markdown) => {
    const ruler = md.block.ruler;
    const { fn: table, alt } = ruler.__rules__[ruler.__find__('table')];
    const cellsLeft = new WeakMap<StateBlock, number>();

    ruler.at(
        'table',
        (state, startLine, endLine, silent) => {
            if (silent) {
                return table(state, startLine, endLine, silent);
            }
            const delimiterRow = state.src.slice(state.bMarks[startLine + 1], state.eMarks[startLine + 1]);
            const columns = Math.max(delimiterRow.split('|').filter((column) => column.trim()).length, 1);
            const cells = cellsLeft.get(state) ?? Math.min(state.src.length, MAX_TABLE_CELLS);

            const firstRow = startLine + 2;
            if (!table(state, startLine, Math.min(endLine, firstRow + Math.floor(cells / columns)), silent)) {
                return false;
            }
            cellsLeft.set(state, cells - columns * (state.line - firstRow));
            return true;
        },
        { alt }
    );
};

/**
 * Every use of a link reference copies the URL and the title of its definition, so `n` characters render to `n * n / 16`:
 * 40 KB (a URL of 20000 characters, used 5000 times as `[a]`) become 100 MB.
 *
 * As in cmark, all uses together may copy as much as the text is long. After that a reference is not found any more and
 * stays as it was written.
 */
const limitReferences = (md: Markdown) => {
    md.core.ruler.after('block', 'reference_limit', (state) => {
        if (!state.env.references) {
            return;
        }
        let sizeLeft = Math.max(state.src.length, MIN_REFERENCE_SIZE);
        state.env.references = new Proxy(state.env.references, {
            get: (references, label: string) => {
                const reference = references[label];
                if (reference) {
                    sizeLeft -= reference.href.length + reference.title.length;
                }
                return sizeLeft < 0 ? undefined : reference;
            },
        });
    });
};

// How many lines all quotes of a text may look ahead over, per line of the text, and at least.
const BLOCKQUOTE_LINES_PER_LINE = 64;
const MIN_BLOCKQUOTE_LINES = 1024;

/**
 * The line before which markdown-it's blockquote rule stops looking ahead: an empty line, a line after a `>` with nothing
 * else, or a line that starts another block. Other lines are lazy continuation lines and do not stop it.
 */
const quoteEnd = (state: StateBlock, startLine: number, endLine: number) => {
    const terminators = state.md.block.ruler.getRules('blockquote');
    const parentType = state.parentType;
    state.parentType = 'blockquote';
    let lastLineEmpty = false;
    let line = startLine;
    for (; line < endLine; line++) {
        const pos = state.bMarks[line] + state.tShift[line];
        const max = state.eMarks[line];
        if (pos >= max) {
            break;
        }
        if (state.src.codePointAt(pos) === 0x3e && state.sCount[line] >= state.blkIndent) {
            lastLineEmpty = state.skipSpaces(pos + 1) >= max;
            continue;
        }
        if (lastLineEmpty || terminators.some((terminator) => terminator(state, line, endLine, true))) {
            break;
        }
    }
    state.parentType = parentType;
    return line;
};

/**
 * Before it parses a quote, markdown-it looks ahead for its end, and a lazy continuation line keeps it going. In
 * `a\n>>\n` repeated, every quote looks ahead to the end of the text and then only keeps its first line, so the time
 * grows with the square of the length: 40 KB take 2 s.
 *
 * All quotes of a text together may look ahead over a multiple of its lines. When that is used up, a quote ends after
 * as many lines as are left, but at least one, and the next line that starts with `>` starts the next quote.
 */
const limitBlockquoteLines = (md: Markdown) => {
    const ruler = md.block.ruler;
    const { fn: blockquote, alt } = ruler.__rules__[ruler.__find__('blockquote')];
    const linesLeft = new WeakMap<StateBlock, number>();

    ruler.at(
        'blockquote',
        (state, startLine, endLine, silent) => {
            // the rule is tried at every line, and the silent run only checks for a `>` without looking ahead
            const isQuote = blockquote(state, startLine, endLine, true);
            if (silent || !isQuote) {
                return isQuote;
            }
            const lines = linesLeft.get(state) ?? Math.max(state.lineMax, MIN_BLOCKQUOTE_LINES) * BLOCKQUOTE_LINES_PER_LINE;
            const window = startLine + Math.max(Math.min(endLine - startLine, lines), 1);
            linesLeft.set(state, lines - (quoteEnd(state, startLine, window) - startLine));
            return blockquote(state, startLine, window, silent);
        },
        { alt }
    );
};

/**
 * `MarkdownIt()` for text that users of the upstream have written, which must not render to far more than they wrote,
 * or take much longer to render than its length.
 */
const markdownIt = (...args: Parameters<typeof MarkdownIt>) =>
    MarkdownIt(...args)
        .use(limitTableCells)
        .use(limitReferences)
        .use(limitBlockquoteLines);

export default markdownIt;
