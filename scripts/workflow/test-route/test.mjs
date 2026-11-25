import fs from 'node:fs/promises';
import path from 'node:path';

import jsBeautify from 'js-beautify';

const routeTestFailed = 'auto: not ready to review';
const readyToReview = 'auto: ready to review';

/**
 * @param {{ github: ReturnType<typeof import('@actions/github').getOctokit>, context: typeof import('@actions/github').context, core: typeof import('@actions/core') }} githubScript
 * @param {string} baseUrl
 * @param {string[]} routes
 * @param {number} number
 * @returns {Promise<void>}
 */
export default async function test({ github, context, core }, baseUrl, routes, number) {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    const artifactDir = path.join(process.env.RUNNER_TEMP, 'route-test');
    await fs.mkdir(artifactDir, { recursive: true });
    let summaryTable = `| Route | Result |
| --- | --- |
`;
    const summaryDetails = [];

    let commentList = [];
    let successCount = 0;
    let failCount = 0;
    let comment = `Successfully [generated](${process.env.GITHUB_SERVER_URL}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) as following:\n`;

    for (const lks of links) {
        core.info(`testing route:  ${lks}`);
        let success = false;
        let detail;

        // oxlint-disable-next-line no-await-in-loop - intended, one at a time
        const res = await fetch(lks);
        // oxlint-disable-next-line no-await-in-loop - intended, one at a time
        const body = await res.text();
        if (res.ok) {
            success = true;
            successCount++;
            detail = jsBeautify.html(body.replaceAll(/\s+(\n|$)/g, '\n'), { indent_size: 2 });

            const file = path.join(artifactDir, `${lks.slice(baseUrl.length + 1).replaceAll(/[/\\":<>|*?\r\n]/g, '_')}.xml`);
            try {
                // oxlint-disable-next-line no-await-in-loop - intended, one at a time
                await fs.writeFile(file, body);
            } catch (error) {
                core.warning(error);
            }
        } else {
            if (body && !body.includes('ConfigNotFoundError')) {
                failCount++;
            }
            detail = `HTTPError: Response code ${res.status} (${res.statusText})`;
            const errInfoList = body && body.match(/(?<=<p class="message">)(.+?)(?=<\/p>)/gs);
            if (errInfoList) {
                detail += '\n\n';
                detail += errInfoList
                    .slice(0, 5)
                    .map((e) => {
                        e = e.replaceAll(/<code class="[^"]+">|<\/code>/g, '').trim();
                        return e.length > 1000 ? e.slice(0, 1000) + '...' : e;
                    })
                    .join('\n');
            }
        }

        let routeFeedback = `
<details>
<summary><a href="${lks}">${lks.replaceAll('&', '&amp;')}</a> - ${success ? 'Success ✔️' : '<b>Failed ❌</b>'}</summary>

\`\`\`${success ? 'rss' : ''}`;
        summaryTable += `| \`${lks.slice(baseUrl.length).replaceAll('|', String.raw`\|`)}\` | ${success ? 'Success ✔️' : '<b>Failed ❌</b>'} |
`;
        summaryDetails.push({ head: routeFeedback, detail });
        routeFeedback += `
${detail.slice(0, 65300 - routeFeedback.length)}
\`\`\`
</details>
`;
        if (comment.length + routeFeedback.length >= 65500) {
            comment += '\n\n...';
            commentList.push(comment);
            comment = routeFeedback;
        } else {
            comment += routeFeedback;
        }
    }

    if (comment.length > 0) {
        commentList.push(comment);
    }

    let summary = summaryTable;
    for (const { head, detail } of summaryDetails) {
        const tooLarge = Buffer.byteLength(summary) + Buffer.byteLength(head) + Buffer.byteLength(detail) > 1_000_000; // 1MiB
        summary += `${head}
${tooLarge ? 'Too large for the job summary, see the artifact.' : detail}
\`\`\`
</details>
`;
    }
    try {
        await core.summary.addRaw(summary).write();
    } catch (error) {
        core.warning(error);
    }

    if (commentList.length >= 5) {
        commentList = commentList.slice(0, 5);
    }

    if (process.env.PULL_REQUEST) {
        const resultLabel = failCount === links.length || successCount <= failCount ? routeTestFailed : readyToReview;

        if (resultLabel === routeTestFailed) {
            let issue;
            try {
                const response = await github.rest.issues.get({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    issue_number: number,
                });
                issue = response.data;
            } catch (error) {
                core.warning(error);
                throw error;
            }
            if (issue.labels.some((l) => l.name === readyToReview)) {
                try {
                    await github.rest.issues.removeLabel({
                        issue_number: number,
                        owner: context.repo.owner,
                        repo: context.repo.repo,
                        name: readyToReview,
                    });
                } catch (error) {
                    core.warning(error);
                }
            }
        }

        try {
            await github.rest.issues.addLabels({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                labels: [resultLabel],
            });
        } catch (error) {
            core.warning(error);
        }
    }

    for (const comment of commentList) {
        try {
            // oxlint-disable-next-line no-await-in-loop - intended, one at a time
            await github.rest.issues.createComment({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment,
            });
        } catch (error) {
            core.warning(error);
        }
    }
}
