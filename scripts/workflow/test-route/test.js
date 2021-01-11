/* eslint-disable */

module.exports = async ({github, context}, baseUrl, routes, number) => {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    let com = 'Successfully generated as following:\n\n';

    for (const lks of links) {
        console.log("testing route: ", lks)
        // Intended, one at a time
        const res = await github.request(`GET ${lks}`).catch(err => {
            com+= `

<details>
    <summary><a href="${lks}">${lks}</a>  - **Failed**</summary>

\`\`\`
    ${err}
\`\`\`
</details>

`;
        });
        if (res && res.data) {
            const { data } = res;
            com += `
<details>
    <summary><a href="${lks}">${lks}</a>  - Success</summary>

\`\`\`
    ${data.split("\n").slice(0, 30).join("\n")}
\`\`\`
</details>

`;
        }
    }
    github.issues.addLabels({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: ['Auto: Route Test Complete']
<<<<<<< HEAD
    }).catch((e) => { core.warning(e) })
=======
    });
>>>>>>> 036796e716f578efe821da8efcd3695376daa635
    github.issues.createComment({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: com
<<<<<<< HEAD
    }).catch((e) => { core.warning(e) })
}
=======
    });
};
>>>>>>> 036796e716f578efe821da8efcd3695376daa635
