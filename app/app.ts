import fastify from "fastify";
import multipart from "fastify-multipart";
import swagger from "fastify-swagger";
import { setupArticleRouter } from "./routes/article";
import { setupCategoryRouter } from "./routes/category";
import { setupFileRouter } from "./routes/file";
import { setupBaseRouter } from "./routes/index";
import { setupPermissionRouter } from "./routes/permission";
import { setupRoleRouter } from "./routes/role";
import { setupUserRouter } from "./routes/user";

const app = fastify({
  logger: true
}).register(multipart, {
  sharedSchemaId: "#mySharedSchema"
}).register(swagger, {
  routePrefix: "/docs",
  swagger: {
    host: "localhost:5050",
    schemes: ["http"],
    consumes: ["application/json", "multipart/form-data"],
    produces: ["application/json"],
    tags: [
      { name: "user", description: "用户" },
      { name: "file", description: "文件上传" }
    ],
    securityDefinitions: {
      apiKey: {
        type: "apiKey",
        name: "token",
        in: "header"
      }
    }
  },
  uiConfig: {
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: header => header,
  exposeRoute: true
});

app.setErrorHandler((err, req, res) => {
  res.status(500).send(err);
});

setupBaseRouter(app);
setupUserRouter(app);
setupFileRouter(app);
setupCategoryRouter(app);
setupArticleRouter(app);
setupPermissionRouter(app);
setupRoleRouter(app);

app.listen(5050, () => {
  console.log("server running...");
  app.swagger();
});

export default app;

// https://github.com/fastify/fastify-example-twitter
