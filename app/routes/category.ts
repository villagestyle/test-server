import { FastifyInstance } from "fastify";
import Joi from "joi";
import * as CategoryService from "../services/category";
import { BaseIdValidate } from "../utils/constant";

const CategoryValidate = Joi.object({
  pid: Joi.string().length(24),
  name: Joi.string().min(1).max(50).required(),
  sort: Joi.number().min(1).max(100).required()
});

const BaseStatusValidate = Joi.allow(0, 1, 2).required();

export const setupCategoryRouter = (app: FastifyInstance) => {
  // 新增分类
  app.post("/category/add", async (req, res) => {
    const data = req.body as CategoryAddCredentials;

    const result = CategoryValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await CategoryService.addCategory(data);

    res.status(ret.code).send(ret);
  });

  // 获取分类信息
  app.get("/category/:id", async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const ret = await CategoryService.getCategory(id);

    res.status(ret.code).send(ret);
  });

  // 更新分类信息
  app.put('/category/:id', async (req, res) => {
    const params = req.params as { id: string };
    const data = req.body as CategoryAddCredentials;
    const result = CategoryValidate.validate(data);
    const result2 = BaseIdValidate.validate(params.id);

    if (result.error || result2.error) {
      res.status(500).send({ msg: result.error || result2.error, code: 500 });
      return;
    }

    const ret = await CategoryService.updateCategory(params.id, data);
    
    res.status(ret.code).send(ret);
  });

  // 删除分类信息
  app.delete('/category/:id', async (req, res) => {
    const params = req.params as { id: string };

    const result = BaseIdValidate.validate(params.id);
    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await CategoryService.deleteCategory(params.id);

    res.status(ret.code).send(ret);
  });

  // 获取分类列表
  app.get('/category/list', async (req, res) => {
    const params = req.query as { pid?: string };

    const ret = await CategoryService.categoryList(params.pid);

    res.status(ret.code).send(ret); 
  })

  // 更新分类状态
  app.put("/category/status/:id", async (req, res) => {
    const params = req.params as { id: string };
    const query = req.query as { status: BaseStatus };

    const ret1 = BaseStatusValidate.validate(Number(query.status));
    const ret2 = BaseIdValidate.validate(params.id);

    if (ret1.error || ret2.error) {
      res.status(500).send({ code: 500, data: ret1.error || ret2.error });
      return;
    }

    const ret = await CategoryService.updateCategory(params.id, {status: query.status});
    
    res.status(ret.code).send(ret);
  })
};
