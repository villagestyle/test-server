/** 分类新增凭证 */
interface CategoryAddCredentials {
    name: string;
    /** 如果为二级分类则传递pid参数(父级id) */
    pid?: string;
    status?: BaseStatus;
    articleNum?: number;
    sort?: number;
}

type CategoryUpdateCredentials = Partial<CategoryAddCredentials>;

// 分类信息详情
interface CategorySchema {
    name: string;
    pid: string;
    updateTime: string;
    creTime: string;
    status: BaseStatus;
    articleNum: number;
    sort: number;
}