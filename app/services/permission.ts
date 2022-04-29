import { ObjectId, WithId } from "mongodb";
import { closeConnect, connectMongo } from "../utils/connectSQL";

type PermissionSchemaWithId = WithId<PermissionSchema>;

// 新增权限
export const addPermission = async (
  data: PermissionAddCredentials
): Promise<ResponseInfo<null>> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const exist = await permissionDataSet.findOne({
    permissionStr: data.permissionStr
  });

  if (exist) {
    return { code: 500, msg: "已存在同名权限" };
  }

  await permissionDataSet.insertOne({
    ...data,
    creTime: new Date().getTime().toString(),
    updateTime: new Date().getTime().toString(),
    status: 1,
    sort: data.sort,
    _id: new ObjectId()
  });

  closeConnect();

  return { code: 200 };
};

// 编辑权限
export const updatePermission = async (
  id: string,
  data: PermissionEditCredentials
): Promise<ResponseInfo<null>> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const exist = await permissionDataSet.findOne({
    permissionStr: data.permissionStr
  });

  if (exist) {
    return { code: 500, msg: "已存在同名权限" };
  }

  await permissionDataSet.updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: {
        ...data,
        updateTime: new Date().getTime().toString()
      }
    }
  );

  closeConnect();

  return { code: 200 };
};

/** 获取权限信息 */
export const getPermission = async (
  id: string,
  isCloseConnect = true
): Promise<ResponseInfo<PermissionSchemaWithId>> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const info = await permissionDataSet.findOne({ _id: new ObjectId(id) });
  isCloseConnect && closeConnect();

  if (info) {
    return { code: 200, data: info };
  } else {
    return { code: 500, msg: "权限信息不存在" };
  }
};

/** 删除权限 */
export const deletePermission = async (
  id: string
): Promise<ResponseInfo<PermissionSchemaWithId>> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const info = await getPermission(id, false);

  if (info.code !== 200) {
    return info;
  }

  await permissionDataSet.deleteOne({ _id: new ObjectId(id) });

  closeConnect();

  return { code: 200 };
};

/** 分页获取权限 */
export const page = async (
  data: PermissionPageSearch
): Promise<ResponseInfo<PageResponse<PermissionSchemaWithId[]>>> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const result = await permissionDataSet
    .find({
      permissionStr: { $regex: data.permissionStr }
    })
    .skip((data.page - 1) * data.pageSize)
    .limit(data.pageSize)
    .toArray();

  const count = await permissionDataSet.find().count();

  closeConnect();

  return {
    code: 200,
    data: {
      list: result,
      totalPage: Math.ceil(count / data.pageSize),
      ...data
    }
  };
};

/** 获取权限列表 */
export const list = async (): Promise<
  ResponseInfo<PermissionSchemaWithId[]>
> => {
  const permissionDataSet = await (
    await connectMongo()
  ).collection<PermissionSchemaWithId>("permission");

  const result = await permissionDataSet.find().toArray();

  return { code: 200, data: result };
};
