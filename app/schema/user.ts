import { RouteShorthandOptions } from "fastify";

export const UserInfo = {
  type: "object",
  properties: {
    username: { type: "string" },
    password: { type: "string" },
    sex: { type: "number" },
    memo: { type: "string" },
    token: { type: "string", description: "登录所返回的凭证" }
  }
};

export const UserLoginSchema: RouteShorthandOptions = {
  schema: {
    tags: ["user"],
    summary: "用户登录",
    description: "用户登录接口",
    body: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string", description: "用户名" },
        password: { type: "string", description: "密码" }
      }
    },
    response: {
      200: {
        description: "SUCCESS",
        type: "object",
        properties: {
          code: { type: "number" },
          msg: { type: "string" },
          data: UserInfo
        }
      }
    }
  }
};

export const UserRegisterSchema: RouteShorthandOptions = {
  schema: {
    tags: ["user"],
    summary: "用户注册",
    description: "用户注册接口",
    body: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string", description: "用户名" },
        password: { type: "string", description: "密码" },
        sex: { type: "number", description: "性别 0: 女 | 1: 男 | 2: 未知" },
        memo: { type: "string", description: "简介" }
      }
    },
    response: {
      200: {
        description: "SUCCESS",
        type: "object"
      }
    }
  }
};

export const UserInfoSchema: RouteShorthandOptions = {
  schema: {
    tags: ["user"],
    summary: "获取用户信息",
    description: "获取用户信息",
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "用户id" }
      }
    },
    response: {
      200: {
        description: "SUCCESS",
        type: "object"
      }
    }
  }
};
