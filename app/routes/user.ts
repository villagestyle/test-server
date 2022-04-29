import { FastifyInstance } from "fastify";
import Joi from "joi";
import {
  UserInfoSchema,
  UserLoginSchema,
  UserRegisterSchema
} from "../schema/user";
import * as UserService from "../services/user";
import { BaseIdValidate } from "../utils/constant";

// 登录参数校验
const UserLoginValidate = Joi.object<UserLoginCredentials>({
  username: Joi.string().min(3).max(16).required(),
  password: Joi.string().min(6).max(16).required()
});

// 用户注册参数校验
const UserRegisterValidate = Joi.object<UserRegisterCredentials>({
  username: Joi.string().min(3).max(16).required(),
  password: Joi.string().min(6).max(16).required(),
  sex: Joi.allow(0, 1, 2),
  memo: Joi.string().max(50)
});

const UserPageSearchValidate = Joi.object<UserPageSearch>({
  username: Joi.string(),
  page: Joi.number().min(0).integer().required(),
  pageSize: Joi.number().min(0).integer().required()
});

export const setupUserRouter = (app: FastifyInstance) => {
  // 测试接口
  // app.post("/test/1", async (req, res) => {
  //   const params = await req.file();
  //   console.log("这是params", req.params);
  //   console.log("这是params", params);
  //   res.status(200).send({ code: 200, data: { msg: "hello world" } });
  // });

  // 登录接口
  app.post("/user/login", UserLoginSchema, async (req, res) => {
    const data = req.body as UserLoginCredentials;

    console.log(data);

    const result = UserLoginValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await UserService.login(data);

    res.status(ret.code).send(ret);
  });

  // 用户注册
  app.post("/user/register", UserRegisterSchema, async (req, res) => {
    const data = req.body as UserRegisterCredentials;

    const result = UserRegisterValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await UserService.register(data);

    res.status(ret.code).send(ret);
  });

  // 获取用户信息
  app.get("/user/:id", UserInfoSchema, async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const result = BaseIdValidate.validate(id);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await UserService.getUserInfo(id);

    res.status(ret.code).send(ret);
  });

  // 分页获取用户信息
  app.post("/user/page", async (req, res) => {
    const data = req.body as UserPageSearch;

    const result = UserPageSearchValidate.validate(data);

    if (result.error) {
      res.status(500).send({ msg: result.error, code: 500 });
      return;
    }

    const ret = await UserService.page(data);

    res.status(ret.code).send(ret);
  });
};
