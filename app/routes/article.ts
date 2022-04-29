import { FastifyInstance } from "fastify";
import Joi from "joi";
import { BaseIdValidate } from "../utils/constant";
import * as ArticleService from "../services/article";

const ArticleValidate = Joi.object({
  title: Joi.string().min(1).max(50).required(),
  desc: Joi.string().max(1000),
  content: Joi.string().max(10000),
  pid: BaseIdValidate
});

export const setupArticleRouter = (app: FastifyInstance) => {
  // 获取文章详情
  app.get("/article/:id", async (req, res) => {
    const params = req.params as { id: string };

    const ret = BaseIdValidate.validate(params.id);

    if (ret.error) {
      res.status(500).send({ code: 500, msg: ret.error });
      return;
    }

    const result = await ArticleService.getArticle(params.id);

    res.status(result.code).send(result);
  });

  // 新增文章
  app.post("/article", async (req, res) => {
    const data = req.body as ArticleAddCredentials;

    const result = ArticleValidate.validate(data);

    if (result.error) {
      res.status(500).send({ code: 500, msg: result.error });
    }

    const ret = await ArticleService.addArticle(data);

    res.status(ret.code).send(ret);
  });

  // 删除文章
  app.delete("/article/:id", async (req, res) => {
    const params = req.params as { id: string };

    const ret = BaseIdValidate.validate(params.id);

    if (ret.error) {
      res.status(500).send({ code: 500, msg: ret.error });
      return;
    }

    const result = await ArticleService.deleteArticle(params.id);

    res.status(result.code).send(result);
  });

  // 修改文章
  app.put("/article/:id", async (req, res) => {
    const params = req.params as { id: string };
    const data = req.body as ArticleAddCredentials;

    const ret = BaseIdValidate.validate(params.id);
    const ret2 = ArticleValidate.validate(data);

    if (ret.error || ret2.error) {
      res.status(500).send({ code: 500, msg: ret.error || ret2.error });
      return;
    }

    const result = await ArticleService.updateArticle(params.id, data);

    res.status(result.code).send(result);
  });

  // 根据分类id获取文章列表
  app.get("/article/list", async (req, res) => {
    const params = req.query as { pid: string; keyword?: string };
    if (params.pid) {
      const ret = BaseIdValidate.validate(params.pid);
      if (ret.error) {
        res.status(500).send({ code: 500, msg: ret.error });
        return;
      }
    }

    const result = await ArticleService.articleList(params.pid, params.keyword || "");
    res.status(result.code).send(result);
  });
};
