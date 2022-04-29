import { FastifyInstance } from "fastify";
import Joi from "joi";
import * as PermissionService from "../services/permission";
import { BaseIdValidate } from "../utils/constant";

const PermissionPageSearchValidate = Joi.object<PermissionPageSearch>({
  permissionStr: Joi.string(),
  page: Joi.number().min(0).integer().required(),
  pageSize: Joi.number().min(0).integer().required()
});

// 用户注册参数校验
const PermissionAddValidate = Joi.object<PermissionAddCredentials>({
  permissionStr: Joi.string().min(3).max(32).required(),
  routerLink: Joi.string().min(3).max(32).required(),
  icon: Joi.string().min(3).max(32).required(),
  sort: Joi.number().min(0).max(1000).required()
});

export const PermissionEditCredentialsValidate = Joi.object<PermissionEditCredentials>(
  {
    permissionStr: Joi.string().min(3).max(32).required(),
    routerLink: Joi.string().min(3).max(32).required(),
    icon: Joi.string().min(3).max(32).required(),
    sort: Joi.number().min(0).max(1000).required(),
    status: Joi.allow(0, 1, 2).required()
  }
);

export const setupPermissionRouter = (app: FastifyInstance) => {
  // 获取权限列表
  app.get("/permission/list", async (req, res) => {
    const result = await PermissionService.list();

    res.status(result.code).send(result);
  });

  // 分页获取权限
  app.post("/permission/page", async (req, res) => {
    const data = req.body as PermissionPageSearch;

    const result = PermissionPageSearchValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await PermissionService.page(data);

    res.status(ret.code).send(ret);
  });

  // 根据id获取权限
  app.get("/permission/:id", async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const result = BaseIdValidate.validate(id);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await PermissionService.getPermission(id);

    res.status(ret.code).send(ret);
  });

  // 新增权限
  app.post("/permission/add", async (req, res) => {
    const data = req.body as PermissionAddCredentials;

    const result = PermissionAddValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await PermissionService.addPermission(data);

    res.status(ret.code).send(ret);
  });

  // 修改权限
  app.put("/permission/:id", async (req, res) => {
    const data = req.body as PermissionEditCredentials;
    const params = req.params as { id: string };
    const id = params.id;

    const result1 = BaseIdValidate.validate(id);
    const result2 = PermissionEditCredentialsValidate.validate(data);

    if (result1.error || result2.error) {
      res.status(500).send({ msg: result1.error || result2.error, code: 500 });
      return;
    }

    const ret = await PermissionService.updatePermission(id, data);

    res.status(ret.code).send(ret);
  });

  // 删除权限
  app.delete("/permission/:id", async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const result = BaseIdValidate.validate(id);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await PermissionService.deletePermission(id);

    res.status(ret.code).send(ret);
  });
};
