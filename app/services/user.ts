import { object } from "joi";
import { ObjectId, WithId } from "mongodb";
import { closeConnect, connectMongo } from "../utils/connectSQL";
import TokenService from "./token";

type UserInfoWith = WithId<UserInfo>;

/** 用户登录 */
export const login = async (
  data: UserLoginCredentials
): Promise<ResponseInfo<UserInfoWithToken>> => {
  const userDataSet = await (
    await connectMongo()
  ).collection<UserInfoWith>("user");

  const user = await userDataSet.findOne(data);

  closeConnect();

  if (user) {
    const token = await TokenService.updateToken(user._id.toString());

    const userInfo = await getUserInfo(user._id.toString());

    return { code: 200, data: { ...(userInfo.data as UserInfoWith), token } };
  } else {
    return { code: 500, msg: "用户名或密码错误" };
  }
};

// 注册用户
export const register = async (
  data: UserRegisterCredentials
): Promise<ResponseInfo<null>> => {
  const userDataSet = await (
    await connectMongo()
  ).collection<UserInfoWith>("user");

  const exist = await userDataSet.findOne({
    username: data.username
  });

  if (exist) {
    return { code: 500, msg: "已存在同名用户" };
  }

  await userDataSet.insertOne({
    ...data,
    sex: data.sex || 2,
    _id: new ObjectId(),
    roleId: data.roleId || "0",
    creTime: new Date().getTime().toString(),
    updateTime: new Date().getTime().toString()
  });

  closeConnect();

  return { code: 200 };
};

/** 获取用户信息 */
export const getUserInfo = async (
  userId: string
): Promise<ResponseInfo<UserInfoWith>> => {
  const userDataSet = await (
    await connectMongo()
  ).collection<UserInfoWith>("user");

  const userInfo = await userDataSet.findOne({
    _id: new ObjectId(userId)
  });

  closeConnect();

  if (userInfo) {
    return { code: 200, data: userInfo };
  } else {
    return { code: 500, msg: "用户信息不存在" };
  }
};

/** 更新用户数据 */
export const update = async (
  userId: string,
  data: OptionalUserRegisterCredentials
) => {
  const userDataSet = await (
    await connectMongo()
  ).collection<UserInfoWith>("user");

  const exist = await getUserInfo(userId);

  if (exist.code === 200) {
    userDataSet.updateOne(
      {
        id: userId
      },
      {
        $set: data
      }
    );

    closeConnect();
  } else {
    return exist;
  }
};

export const page = async (
  data: UserPageSearch
): Promise<ResponseInfo<PageResponse<UserInfoWith[]>>> => {
  const userDataSet = await (
    await connectMongo()
  ).collection<UserInfoWith>("user");

  const result = await userDataSet
    .find({
      username: { $regex: data.username }
    })
    .skip((data.page - 1) * data.pageSize)
    .limit(data.pageSize)
    .toArray();

  const count = await userDataSet.find().count();

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

export const productList: Product = {
  "1": {
    name: "老王"
  }
};