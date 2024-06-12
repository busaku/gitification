/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app, { getRouter }) => {
  const router = getRouter();

  router.get("/", (req, res) => {
    res.send("Hello World");
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
