import { FastifyInstance } from "fastify";
import Joi from "joi";
import * as RoleService from "../services/role";
import { BaseIdValidate } from "../utils/constant";
import { PermissionEditCredentialsValidate } from "./permission";

const RolePageSearchValidate = Joi.object<RolePageSearch>({
  name: Joi.string().allow(""),
  page: Joi.number().min(0).integer().required(),
  pageSize: Joi.number().min(0).integer().required()
});

// 用户注册参数校验
const RoleAddValidate = Joi.object<RoleAddCredentials>({
  name: Joi.string().min(3).max(16).required(),
  permission: Joi.array()
});

const RoleEditCredentialsValidate = Joi.object<RoleEditCredentials>({
  name: Joi.string().min(3).max(16).required(),
  permission: Joi.array().items(PermissionEditCredentialsValidate).required(),
  status: Joi.allow(0, 1, 2).required()
});

export const setupRoleRouter = (app: FastifyInstance) => {
  // 获取角色列表
  app.get("/role/list", async (req, res) => {
    const result = await RoleService.list();

    res.status(result.code).send(result);
  });

  // 分页获取角色
  app.post("/role/page", async (req, res) => {
    const data = req.body as RolePageSearch;

    const result = RolePageSearchValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await RoleService.page(data);

    res.status(ret.code).send(ret);
  });

  // 根据id获取角色
  app.get("/role/:id", async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const result = BaseIdValidate.validate(id);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await RoleService.getRole(id);

    res.status(ret.code).send(ret);
  });

  // 新增角色
  app.post("/role/add", async (req, res) => {
    const data = req.body as RoleAddCredentials;

    const result = RoleAddValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    !data.permission && (data.permission = []);

    const ret = await RoleService.addRole(data);

    res.status(ret.code).send(ret);
  });

  // 修改角色
  app.put("/role/:id", async (req, res) => {
    const data = req.body as RoleEditCredentials;
    const params = req.params as { id: string };
    const id = params.id;

    const result1 = BaseIdValidate.validate(id);
    const result2 = RoleEditCredentialsValidate.validate(data);

    if (result1.error || result2.error) {
      res.status(500).send({ msg: result1.error || result2.error, code: 500 });
      return;
    }

    const ret = await RoleService.updateRole(id, data);

    res.status(ret.code).send(ret);
  });

  // 删除角色
  app.delete("/role/:id", async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const result = BaseIdValidate.validate(id);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await RoleService.deleteRole(id);

    res.status(ret.code).send(ret);
  });
};
