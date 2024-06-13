/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

import sqlite3 from 'sqlite3';
import { db, initDatabase } from './src/db/init.js'

export default (app, { getRouter }) => {

  initDatabase();

  const router = getRouter();
  

  router.get("/index", (req, res) => {
    res.send("Willkommen auf der neuen Standardseite!");
  });

  router.get("/test", (req, res) => {
    res.send("Willkommen auf der neuen Standardseite!");
  });

  app.log.info("Yay, the app was loaded!");

  app.on("issue_comment.created", async (context) => {
    app.log.info("Yay, issue_comment created!");
  });

  app.on("issue_comment.edited", async (context) => {
    app.log.info("Yay, issue_comment edited!");
  });

  app.on("pull_request_review_comment.created", async (context) => {
    app.log.info("Yay, pull_request_review_comment created!");
  });

  app.on("pull_request_review_comment.edited", async (context) => {
    app.log.info("Yay, pull_request_review_comment edited!");
  });
};
