import { CronJob } from 'cron';
import { db } from '../db/init.js';
import dayjs from 'dayjs'

const createJob = (cronTime, owner, repo, app) => {
  return new CronJob(
    cronTime,
    async function () {
      let octokit = await app.auth();

      const { data: installations } = await octokit.request('GET /app/installations', {
        headers: {
          accept: 'application/vnd.github.v3+json',
        },
      });

      if (installations.length === 0) {
        throw new Error('No installations found for the app');
      }

      const installationId = installations[0].id;

      octokit = await app.auth(installationId);

      // create issue body, read all actions from db within last week
      const weekAgo = dayjs().subtract(14, 'day').toISOString();

      db.serialize(() => {
        db.all(`SELECT *, COUNT(action) AS ac FROM player_actions WHERE createdAt > ? GROUP BY player, action`, weekAgo, (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            app.log.info(row);
          });
        });
      });

      return;

      await octokit.request('POST /repos/{owner}/{repo}/issues', {
        owner: owner,
        repo: repo,
        title: 'Report of the week ' + new Date().toISOString().slice(0, 10),
        body: 'I\'m having a problem with this.',
        labels: [
          'gitification'
        ],
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      app.log.info('CronJob executed');
    },
    null, // onComplete
    false, // start
    'Europe/Berlin' // timeZone
  );
};

export default createJob;