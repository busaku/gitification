/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

import createJob from './src/job/cron.js';
import { db, initDatabase } from './src/db/init.js'
import path from 'path';
import fs from 'fs';

// load achievements
const configPath = path.resolve('./achievements.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// create regex
const patterns = config.achievements.map(item => item.pattern);
const regex = new RegExp(patterns.map(pattern => pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'gi');

export default (app) => {
  initDatabase();

  const job = createJob(process.env.CRONJOB_SCHEDULE, process.env.REPORT_OWNER, process.env.REPORT_REPO, app);
  job.start();

  function resolveAction(id, sender, body, receiver) {
    // skip own actions
    if(sender === receiver) {
      app.log.info(`Ignoring self-action resolved by ${sender} on ${id}`)
      //return;
    }

    // skip no body
    if(!body) {
      app.log.info(`No body found for ${receiver} by ${sender} on ${id}`)
      return;
    }

    const matches = body.match(regex);

    if (!matches) {
      app.log.info(`No action resolved for ${receiver} by ${sender} on ${id}`)
      return;
    }
    
    db.serialize(() => {
      db.run(`DELETE FROM player_actions WHERE sender = ? AND item = ?`, receiver, id)
      const stmt = db.prepare(`INSERT INTO player_actions (player, action, sender, item) VALUES (?, ?, ?, ?)`);
      matches.forEach(element => {
        stmt.run(receiver, element, sender, id);
      });

      stmt.finalize((err) => {
        let sql = `SELECT * FROM player_actions`;
        db.all(sql, [], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            app.log.info(row);
          });
        });
       });
    });

    app.log.info(`Action resolved for ${receiver} by ${sender} on ${id} with ${matches.length} matches`)
  }

  app.log.info("Yay, the app was loaded!");

  app.on("issue_comment.created", async (context) => {
    resolveAction(context.payload.issue.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.issue.user.login);
  });

  app.on("issue_comment.edited", async (context) => {
    resolveAction(context.payload.issue.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.issue.user.login);
  });

  app.on("pull_request_review.submitted", async (context) => {
    resolveAction(context.payload.review.node_id, context.payload.sender.login, context.payload.review.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review.edited", async (context) => {
    resolveAction(context.payload.review.node_id, context.payload.sender.login, context.payload.review.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review_comment.created", async (context) => {
    resolveAction(context.payload.comment.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review_comment.edited", async (context) => {
    resolveAction(context.payload.comment.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.pull_request.user.login);
  });
};
