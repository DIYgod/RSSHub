import { execSync } from 'child_process';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate: Date | undefined;
if (!gitHash) {
    try {
        gitHash = execSync('git rev-parse HEAD').toString().trim().slice(0, 8);
        gitDate = new Date(execSync('git log -1 --format=%cd').toString().trim());
    } catch {
        gitHash = 'unknown';
    }
}

export { gitHash, gitDate };
