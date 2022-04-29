import { ObjectId, WithId } from "mongodb";
import { closeConnect, connectMongo } from "../utils/connectSQL";
import { DefaultSort } from "../utils/constant";

type CategorySchemaWithId = WithId<CategorySchema>;

// 新增分类
export const addCategory = async (
  data: CategoryAddCredentials
): Promise<ResponseInfo<CategorySchema>> => {
  const categoryDataSet = await (
    await connectMongo()
  ).collection<CategorySchemaWithId>("category");

  const exist = await categoryDataSet.findOne(data);

  if (exist) {
    return { code: 500, msg: "已存在同名类型" };
  }

  // 检测父类是否存在
  if (data.pid) {
    const parentInfo = await getCategory(data.pid, false);
    if (parentInfo.code !== 200) {
      return { code: parentInfo.code, msg: "父级分类信息不存在" };
    }
  }

  const id = new ObjectId();
  const result: CategorySchemaWithId = {
    name: data.name,
    creTime: new Date().getTime().toString(),
    updateTime: new Date().getTime().toString(),
    pid: data.pid || "0",
    articleNum: 0,
    sort: data.sort || DefaultSort,
    _id: id,
    status: 1
  };

  await categoryDataSet.insertOne(result);

  const info = await getCategory(id.toString(), false);

  closeConnect();

  return info;
};

// 获取分类信息
export const getCategory = async (
  id: string,
  isCloseConnect = true
): Promise<ResponseInfo<CategorySchemaWithId>> => {
  const categoryDataSet = await (
    await connectMongo()
  ).collection<WithId<CategorySchema>>("category");

  const info = await categoryDataSet.findOne({ _id: new ObjectId(id) });
  isCloseConnect && closeConnect();

  if (info) {
    return { code: 200, data: info };
  } else {
    return { code: 500, msg: "分类信息不存在" };
  }
};

// 修改分类信息
export const updateCategory = async (
  id: string,
  data: CategoryUpdateCredentials
): Promise<ResponseInfo<CategorySchema>> => {
  const categoryDataSet = await (
    await connectMongo()
  ).collection<WithId<CategorySchema>>("category");

  let info = await getCategory(id, false);

  if (info.code !== 200) {
    return info;
  }

  const exist = await categoryDataSet.findOne({ nam: data.name, $not: { _id: new ObjectId(id) } });

  if (exist) {
    return { code: 500, msg: "已存在该分类" };
  }

  if (data.pid) {
    if (id === data.pid) {
      return { code: 500, msg: "父类id不能为自身id" };
    }

    const parentInfo = await getCategory(data.pid, false);

    if (parentInfo.code !== 200) {
      return { code: 500, msg: "父级分类信息不存在" };
    }
  }

  await categoryDataSet.updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: {
        ...info.data,
        name: data.name,
        pid: data.pid || "0",
        updateTime: new Date().getTime().toString(),
        sort: data.sort || DefaultSort,
        status: data.status || 1,
        articleNum: data.articleNum || info.data?.articleNum
      }
    }
  );

  info = await getCategory(id, false);

  closeConnect();

  return info;
};

// 删除分类信息
export const deleteCategory = async (
  id: string
): Promise<ResponseInfo<null>> => {
  const categoryDataSet = await (
    await connectMongo()
  ).collection<CategorySchemaWithId>("category");

  const info = await getCategory(id, false);

  if (info.code !== 200) {
    return { code: 500, msg: info.msg };
  }

  if (info.data?.pid === "0") {
    const list = await categoryList(info.data?._id.toString());
    if (list.data?.length) {
      return { code: 500, msg: "当前分类下存在子分类，无法删除" };
    }
  }

  await categoryDataSet.deleteOne({ _id: new ObjectId(id) });

  closeConnect();

  return { code: 200 };
};

// 获取父分类下的所有子分类列表
export const categoryList = async (
  pid?: string
): Promise<ResponseInfo<CategorySchemaWithId[]>> => {
  const categoryDataSet = await (
    await connectMongo()
  ).collection<CategorySchemaWithId>("category");

  const result = await categoryDataSet
    .find({
      pid: pid || "0"
    })
    .sort({
      sort: 1,
      updateTime: -1
    })
    .toArray();

  closeConnect();

  return { code: 200, data: result };
};

// 增加分类的所属文章数
export const addArticleNum = async (
  id: string
): Promise<ResponseInfo<null>> => {
  const info = await getCategory(id);

  if (!info.data || info.code !== 200) {
    return { code: 500, msg: "分类不存在" };
  }

  await updateCategory(id, {
    ...info.data,
    articleNum: info.data.articleNum + 1
  });

  if (info.data?.pid !== "0") {
    // 子分类
    await addArticleNum(info.data?.pid);
  }

  return { code: 200 };
};
