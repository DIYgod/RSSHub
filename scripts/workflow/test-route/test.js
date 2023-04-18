/* eslint-disable no-await-in-loop */

module.exports = async ({ github, context, core, got }, baseUrl, routes, number) => {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    let com_l = [];
    let com = `Successfully [generated](${process.env.GITHUB_SERVER_URL}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) as following:\n`;

    for (const lks of links) {
        core.info(`testing route:  ${lks}`);
        // Intended, one at a time
        let success = false;
        let detail = 'no detail';
        try {
            const res = await got(lks);
            if (res && res.body) {
                success = true;
                detail = res.body.replace(/\s+(\n|$)/g, '\n');
            }
        } catch (err) {
            detail = err.toString();
            const errInfoList = err.response && err.response.body && err.response.body.match(/(?<=<pre class="message">)(.+?)(?=<\/pre>)/gs);
            if (errInfoList) {
                detail += '\n\n';
                detail += errInfoList
                    .slice(0, 3)
                    .map((e) => e.trim())
                    .join('\n');
            }
        }

        let temp_com = `
<details>
<summary><a href="${lks}">${lks}</a> - ${success ? 'Success ✔️' : '<b>Failed ❌</b>'}</summary>

\`\`\`${success ? 'rss' : ''}`;
        temp_com += `
${detail.slice(0, 65300 - temp_com.length)}
\`\`\`
</details>
`;
        if (com.length + temp_com.length >= 65500) {
            com += '\n\n...';
            com_l.push(com);
            com = temp_com;
        } else {
            com += temp_com;
        }
    }

    if (com.length > 0) {
        com_l.push(com);
    }

    if (com_l.length >= 5) {
        com_l = com_l.slice(0, 5);
    }

    if (process.env.PULL_REQUEST) {
        await github.rest.issues
            .addLabels({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                labels: ['Auto: Route Test Complete'],
            })
            .catch((e) => {
                core.warning(e);
            });
    }

    for (const com_s of com_l) {
        // Intended, one at a time
        await github.rest.issues
            .createComment({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: com_s,
            })
            .catch((e) => {
                core.warning(e);
            });
    }
};
