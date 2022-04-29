import { ObjectId, WithId } from "mongodb";
import { closeConnect, connectMongo } from "../utils/connectSQL";

type RoleSchemaWithId = WithId<RoleSchema>;

// 新增角色
export const addRole = async (
  data: RoleAddCredentials
): Promise<ResponseInfo<null>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const exist = await roleDataSet.findOne({
    name: data.name
  });

  if (exist) {
    return { code: 500, msg: "已存在同名角色" };
  }

  await roleDataSet.insertOne({
    ...data,
    creTime: new Date().getTime().toString(),
    updateTime: new Date().getTime().toString(),
    status: 1,
    _id: new ObjectId()
  });

  closeConnect();

  return { code: 200 };
};

// 编辑角色
export const updateRole = async (
  id: string,
  data: RoleEditCredentials
): Promise<ResponseInfo<null>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const exist = await roleDataSet.findOne({
    name: data.name
  });

  if (exist) {
    return { code: 500, msg: "已存在同名角色" };
  }

  await roleDataSet.updateOne(
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

/** 获取角色信息 */
export const getRole = async (
  id: string,
  isCloseConnect = true
): Promise<ResponseInfo<RoleSchemaWithId>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const info = await roleDataSet.findOne({ _id: new ObjectId(id) });
  isCloseConnect && closeConnect();

  if (info) {
    return { code: 200, data: info };
  } else {
    return { code: 500, msg: "角色信息不存在" };
  }
};

/** 删除角色 */
export const deleteRole = async (
  id: string
): Promise<ResponseInfo<RoleSchemaWithId>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const info = await getRole(id, false);

  if (info.code !== 200) {
    return info;
  }

  await roleDataSet.deleteOne({ _id: new ObjectId(id) });

  closeConnect();

  return { code: 200 };
};

/** 分页获取角色 */
export const page = async (
  data: RolePageSearch
): Promise<ResponseInfo<PageResponse<RoleSchemaWithId[]>>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const result = await roleDataSet
    .find({
      name: { $regex: data.name }
    })
    .skip((data.page - 1) * data.pageSize)
    .limit(data.pageSize)
    .toArray();

  const count = await roleDataSet.find().count();

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

/** 获取角色列表 */
export const list = async (): Promise<ResponseInfo<RoleSchemaWithId[]>> => {
  const roleDataSet = await (
    await connectMongo()
  ).collection<RoleSchemaWithId>("role");

  const result = await roleDataSet.find().toArray();

  return { code: 200, data: result };
};
