import jsBeautify from 'js-beautify';

export default async function test({ github, context, core }, baseUrl, routes, number) {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    let commentList = [];
    let comment = `Successfully [generated](${process.env.GITHUB_SERVER_URL}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) as following:\n`;

    for await (const lks of links) {
        core.info(`testing route:  ${lks}`);
        // Intended, one at a time
        let success = false;
        let detail;

        const res = await fetch(lks);
        const body = await res.text();
        if (res.ok) {
            success = true;
            detail = jsBeautify.html(body.replaceAll(/\s+(\n|$)/g, '\n'), { indent_size: 2 });
        } else {
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

    if (commentList.length >= 5) {
        commentList = commentList.slice(0, 5);
    }

    if (process.env.PULL_REQUEST) {
        await github.rest.issues
            .addLabels({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                labels: ['Auto: Route Test Complete'],
            })
            .catch((error) => {
                core.warning(error);
            });
    }

    for await (const comment of commentList) {
        // Intended, one at a time
        await github.rest.issues
            .createComment({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment,
            })
            .catch((error) => {
                core.warning(error);
            });
    }
}
