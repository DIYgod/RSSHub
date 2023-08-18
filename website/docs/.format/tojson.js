const fs = require('fs');

function parseMd(name) {
    fs.readFile(`./routes/${name}.md`, 'utf8', (err, data) => {
        const lines = data.split('\n');

        const result = {
            h1: '',
            h2: [],
        };
        let current = '';

        lines.forEach((line) => {
            if (line.startsWith('# ')) {
                result.h1 = line.replace(/^# /, '');
                result.h1 = result.h1.replace(/ {([^}])*}$/, '');
            } else if (line.startsWith('## ')) {
                let h2 = line.replace(/^## /, '');
                // h2 = h2.replace(/ {([^}])*}$/, '');
                current = {
                    h2,
                    content: '',
                    h3: [],
                };
                result.h2.push(current);
            } else if (line.startsWith('### ')) {
                let h3 = line.replace(/^### /, '');
                // h3 = h3.replace(/ {([^}])*}$/, '');
                current = {
                    h3,
                    content: '',
                };
                result.h2[result.h2.length - 1].h3.push(current);
            } else if (current) {
                current.content += line + '\n';
            }
        });

        result.h2.forEach((item) => {
            item.content = item.content.trim();
            item.h3.forEach((h3) => {
                h3.content = h3.content.trim();
            });
        });

        console.log(JSON.stringify(result, null, 2));

        let newContent = `import Route from '@site/src/components/Route';\n\n` + `# ${result.h1}\n\n`;
        result.h2.forEach((item) => {
            newContent += `## ${item.h2}\n\n`;
            if (item.content) {
                newContent += `${item.content}\n\n`;
            }
            item.h3.forEach((h3) => {
                newContent += `### ${h3.h3}\n\n`;
                newContent += `${h3.content}\n\n`;
            });
        });
        fs.writeFile(`./routes/${name}.md`, newContent, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        // fs.writeFile(`./routes/${name}.json`, JSON.stringify(result, null, 2), (err) => {
        //   if (err) throw err;
        //   console.log('The file has been saved!');
        // });
    });
}

[
    'routes/social-media',
    'routes/new-media',
    'routes/traditional-media',
    'routes/bbs',
    'routes/blog',
    'routes/programming',
    'routes/design',
    'routes/live',
    'routes/multimedia',
    'routes/picture',
    'routes/anime',
    'routes/program-update',
    'routes/university',
    'routes/forecast',
    'routes/travel',
    'routes/shopping',
    'routes/game',
    'routes/reading',
    'routes/government',
    'routes/study',
    'routes/journal',
    'routes/finance',
    'routes/other',
].map((name) => parseMd(name.replace(/^routes\//, '')));
