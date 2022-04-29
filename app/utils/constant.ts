import Joi from "joi";
import { pathToRegexp } from "path-to-regexp";

// 网页错误状态码
export const ResponseCode = {
  500: "REQUEST ERROR",
  401: "USER AUTH ERROR",
  404: "NOT FOUND",
  403: "REJECT REQUEST",
  200: "SUCCESS"
};

export const BaseIdValidate = Joi.string().length(24).required();

export const DefaultSort = 10;

// url规则, 匹配规则见path-to-regexp
export const URLWhiteList = [
  { path: "/user/login", methods: "POST" },
  { path: "/user/register", methods: "POST" },
  { path: "/user/:userId", methods: "GET" },
  // 文件上传
  { path: "/file/upload", methods: "POST" },
  // 测试接口
  { path: "/test/:key", methods: "*" },
  { path: "/category/:key", methods: "*" },
  { path: "/article/:key", methods: "*" },
  { path: "/article", methods: "*" },
  { path: "/role/:key", methods: "*" },
  { path: "/permission/:key", methods: "*" },
  // API文档
  { path: "/docs/static/:key", methods: "GET" },
  { path: "/docs/:key", methods: "GET" },
  // 静态资源
  { path: "/assets/:key", methods: "*" },
  // 网页图标
  { path: "/favicon.ico", methods: "*" },
].map(item => {
  return { ...item, urlReg: pathToRegexp(item.path) };
});

// 校验url是否需要token验证 url规则匹配且methods匹配则通过
export const VerifyURL = (url: string, method: string = "*") => {
  return !!URLWhiteList.find(
    item =>
      item.urlReg.exec(url) &&
      (method.toLocaleUpperCase() === item.methods || item.methods === "*")
  );
};

const commandList = ['-ss', '-to', '-i', '-fs', '-vf', '-s', '-r', '-y'];
const commandObject: {
  [key: string]: string
} = {};
commandList.map(key => commandObject[key] = "");

export const GetFfmpegOption = function() {
  return {
    list: commandList,
    data: commandObject,
    add(name: string, value: string) {
      this.data[name] += (this.data[name] ? ',' : '') + value;
    },
    get(name: string) {
      return this.data[name] ? `${name} ${this.data[name]} ` : ''
    },
    toString() {
      return this.list.reduce(((p,c) =>  p + this.get(c) ),'')
    }
  }
}
