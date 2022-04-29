import { ObjectId, WithId } from "mongodb";
import { closeConnect, connectMongo } from "../utils/connectSQL";
import * as CategoryService from "./category";

type ArticleSchemaWithId = WithId<ArticleSchema>;

/** 新增文章 */
export const addArticle = async (
  data: ArticleAddCredentials
): Promise<ResponseInfo<ArticleSchemaWithId>> => {
  const articleDataSet = await (
    await connectMongo()
  ).collection<ArticleSchemaWithId>("article");

  const exist = await articleDataSet.findOne({
    title: data.title,
    pid: data.pid
  });

  if (exist) {
    return { code: 500, msg: "已存在同名文章" };
  }

  // 检测父类是否存在
  const parentInfo = await CategoryService.getCategory(data.pid, false);
  if (parentInfo.code !== 200) {
    return { code: parentInfo.code, msg: "分类信息不存在" };
  }

  // 最多两级
  if (parentInfo.data?.pid === "0") {
    return { code: 500, msg: "一级分类下无法创建文章" };
  }

  const id = new ObjectId();
  const result = {
    ...data,
    creTime: new Date().getTime().toString(),
    updateTime: new Date().getTime().toString(),
    pid: data.pid,
    _id: id
  };

  await articleDataSet.insertOne(result);

  closeConnect();

  return { code: 200 };
};

/** 获取文章信息 */
export const getArticle = async (
  id: string,
  isCloseConnect = true
): Promise<ResponseInfo<ArticleSchemaWithId>> => {
  const articleDataSet = await (
    await connectMongo()
  ).collection<ArticleSchemaWithId>("article");

  const info = await articleDataSet.findOne({ _id: new ObjectId(id) });
  isCloseConnect && closeConnect();

  if (info) {
    return { code: 200, data: info };
  } else {
    return { code: 500, msg: "文章信息不存在" };
  }
};

/** 删除文章 */
export const deleteArticle = async (
  id: string
): Promise<ResponseInfo<ArticleSchemaWithId>> => {
  const articleDataSet = await (
    await connectMongo()
  ).collection<ArticleSchemaWithId>("article");

  const info = await getArticle(id, false);

  if (info.code !== 200) {
    return info;
  }

  await articleDataSet.deleteOne({ _id: new ObjectId(id) });

  closeConnect();

  return { code: 200 };
};

/** 更新文章 */
export const updateArticle = async (
  id: string,
  data: ArticleAddCredentials
): Promise<ResponseInfo<ArticleSchemaWithId>> => {
  const info = await getArticle(id, false);

  if (info.code !== 200) {
    return info;
  }

  const articleDataSet = await (
    await connectMongo()
  ).collection<ArticleSchemaWithId>("article");

  const exist = await articleDataSet.findOne({
    title: data.title,
    pid: data.pid
  });

  if (exist) {
    return { code: 500, msg: "已存在同名文章" };
  }

  await articleDataSet.updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: {
        ...info.data,
        updateTime: new Date().getTime().toString(),
        title: data.title,
        desc: data.desc,
        content: data.content,
        pid: data.pid
      }
    }
  );

  closeConnect();

  return { code: 200 };
};

/** 根据分类id返回文章列表 */
export const articleList = async (
  pid: string = "",
  keyword: string = "",
  isCloseConnect = true
): Promise<ResponseInfo<ArticleSchemaWithId[]>> => {

  const reg: Record<string, any> = {
    pid
  }

  if (pid) {
    const categoryInfo = await CategoryService.getCategory(pid, false);
    if (categoryInfo.code !== 200) {
      return { code: 200, msg: "分类信息不存在", data: [] };
    }

    if (categoryInfo.data?.pid === "0") {
      const categoryList = await CategoryService.categoryList(pid);

      const ids = categoryList.data
        ?.map(d => d._id)
        .map(id => {
          return new Promise<ArticleSchemaWithId[]>(async (resolve, reject) => {
            const result = await articleList(id.toString(), keyword, false);

            if (result.code !== 200 || !result.data) {
              reject(false);
            } else {
              resolve(result.data);
            }
          });
        });

      if (ids?.length) {
        const res = await Promise.all(ids);
        const result = res.reduce((pre, cur) => [...pre, ...cur], []);
        return { code: 200, data: result };
      } else {
        return { code: 200, data: [] };
      }
    }
  } else {
    delete reg.pid;
  }

  // 父类情况
  const articleDataSet = await (
    await connectMongo()
  ).collection<ArticleSchemaWithId>("article");

  const result = await articleDataSet
    .find({
      ...reg,
      $or: [{ title: { $regex: keyword } }, { desc: { $regex: keyword } }]
    })
    .toArray();

  isCloseConnect && closeConnect();

  return { code: 200, data: result };
};
