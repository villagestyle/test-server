import fastify, { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import TokenService from "../services/token";
import { VerifyURL } from "../utils/constant";

export const setupBaseRouter = (app: FastifyInstance) => {
  app.addHook("onRequest", (req, res, done) => {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    //让options尝试请求快速结束
    if (req.method.toLowerCase() == "options") res.send(200);
    done();
  });

  // token校验
  app.addHook("onRequest", async (req, res) => {
    const url = req.url.split("?")[0];
    const token = req.headers["Authorization"];

    //  静态资源或者白名单
    if (VerifyURL(url, req.method)) {
      return Promise.resolve({ data: "触发" });
    }
    if (!token || token == "null" || typeof token !== "string") {
      res.status(401).send({ msg: "请携带token进行请求", code: 401 });
      return;
    }
    const data = jwt.decode(token) as UserTokenInfo;
    if (!data) {
      res.status(401).send({ msg: "请携带token进行请求", code: 401 });
      return;
    }

    // 查询数据库中是否存在这条数据
    const lib_token = await TokenService.findTokenFromDB({
      userId: data._id,
      assess_token: token
    });

    if (!lib_token) {
      res.status(401).send({ msg: "need Authorization", code: 401 });
      return;
    }

    jwt.verify(
      lib_token.refresh_token,
      Config.AssessTokenKey,
      async (err: unknown) => {
        if (err) {
          // token过期
          res.status(401).send({ msg: "need Authorization", code: 401 });
          return;
        } else {
          TokenService.updateToken(data._id);
        }
      }
    );
  });

  // 统一错误拦截
  app.setErrorHandler((error, req, res) => {
    app.log.error(error);
    res.status(500).send({ msg: "未知错误", code: 500 });
  });
};
