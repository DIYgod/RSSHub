/**
 * Fork of https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf681a29f0f33db91bcfffdabeb9345d609/lib/handle/heading.js
 * v1.5.0
 */

/**
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('../types.js').Parent} Parent
 * @typedef {import('../types.js').State} State
 * @typedef {import('../types.js').Info} Info
 */

// import { formatHeadingAsSetext } from "../util/format-heading-as-setext.js";

/**
 * @param {Heading} node
 * @param {Parent | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function heading(node, _, state, info) {
    const rank = Math.max(Math.min(6, node.depth || 1), 1);
    const tracker = state.createTracker(info);

    // if (formatHeadingAsSetext(node, state)) {
    //     const exit = state.enter("headingSetext");
    //     const subexit = state.enter("phrasing");
    //     const value = state.containerPhrasing(node, {
    //         ...tracker.current(),
    //         before: "\n",
    //         after: "\n",
    //     });
    //     subexit();
    //     exit();

    //     return (
    //         value +
    //         "\n" +
    //         (rank === 1 ? "=" : "-").repeat(
    //             // The whole size…
    //             value.length -
    //                 // Minus the position of the character after the last EOL (or
    //                 // 0 if there is none)…
    //                 (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1),
    //         )
    //     );
    // }

    const sequence = '#'.repeat(rank);
    const exit = state.enter('headingAtx');
    const subexit = state.enter('phrasing');

    // Note: for proper tracking, we should reset the output positions when there
    // is no content returned, because then the space is not output.
    // Practically, in that case, there is no content, so it doesn’t matter that
    // we’ve tracked one too many characters.
    tracker.move(sequence + ' ');

    let value = state.containerPhrasing(node, {
        before: '# ',
        after: '\n',
        ...tracker.current(),
    });

    if (/^[\t ]/.test(value)) {
        // To do: what effect has the character reference on tracking?
        value = '&#x' + value.charCodeAt(0).toString(16).toUpperCase() + ';' + value.slice(1);
    }

    value = value ? sequence + ' ' + value + (node.data?.id ? ' {#' + node.data?.id + '}' : '') : sequence;

    if (state.options.closeAtx) {
        value += ' ' + sequence;
    }

    subexit();
    exit();

    return value;
}
