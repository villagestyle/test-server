// 数据库中的token数据结构
interface ConnectToken {
  refresh_token: string;
  userId: string;
  assess_token: string;
}

// 全局配置文件
interface ConfigType {
  readonly SysNo: string;
  readonly AssessTokenKey: string;
}

// 统一状态码
// https://blog.csdn.net/qq_26988127/article/details/72757986

type ResponseCode = 401 | 500 | 404 | 403 | 200;
interface ResponseInfo<D = any, M = string> {
  code: ResponseCode;
  msg?: M;
  data?: D
}

type WithPageQuery<T> = T & {
  page: number;
  pageSize: number;
}

type WithTimer<T> = T & {
  updateTime: string;
  creTime: string;
}

/** 0: 停用, 1: 启用, 3: 假删除 */
type BaseStatus = 0 | 1 | 2;

type PageResponse<T> = WithPageQuery<{
  list: T,
  totalPage: number;
}>

interface Product{
  [key: string]: object
}