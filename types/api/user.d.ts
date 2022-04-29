// 用户登录凭证
interface UserLoginCredentials {
  username: string;
  password: string;
}

// 用户注册凭证
interface UserRegisterCredentials {
  username: string;
  password: string;
  sex?: Sex;
  memo?: string;
  // 角色id
  roleId: string;
}

// 选项化用户注册凭证
type OptionalUserRegisterCredentials = Partial<UserRegisterCredentials>;

type UserInfoWithToken = UserInfo & { token: string };

// 数据库中存储的用户信息
interface UserInfo {
  username: string;
  password: string;
  sex: Sex;
  memo?: string;
  roleId: string;
  creTime: string;
  updateTime: string;
}

type Sex = 0 | 1 | 2;

interface UserTokenInfo {
  _id: string;
}

type UserPageSearch = WithPageQuery<Partial<{
    username: string;
}>>
