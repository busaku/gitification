/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

import { db, initDatabase } from './src/db/init.js'

export default (app, { getRouter }) => {
  initDatabase();

  const router = getRouter();

  function resolveAction(id, sender, body, receiver) {
    app.log.info({ id, sender, body, receiver });
  }
  
  router.get("/index", (req, res) => {
    res.send("Welcome to gitification!");
  });

  app.log.info("Yay, the app was loaded!");

  app.on("issue_comment.created", async (context) => {
    resolveAction(context.payload.issue.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.issue.user.login);
  });

  app.on("issue_comment.edited", async (context) => {
    resolveAction(context.payload.issue.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.issue.user.login);
  });

  app.on("pull_request_review.submitted", async (context) => {
    resolveAction(context.payload.pull_request.node_id, context.payload.sender.login, context.payload.review.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review.edited", async (context) => {
    resolveAction(context.payload.pull_request.node_id, context.payload.sender.login, context.payload.review.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review_comment.created", async (context) => {
    resolveAction(context.payload.pull_request.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.pull_request.user.login);
  });

  app.on("pull_request_review_comment.edited", async (context) => {
    resolveAction(context.payload.pull_request.node_id, context.payload.sender.login, context.payload.comment.body, context.payload.pull_request.user.login);
  });
};
