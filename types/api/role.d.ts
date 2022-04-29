interface RoleSchema {
    name: string;
    creTime: string;
    updateTime: string;
    permission: PermissionSchema[];
    status: BaseStatus;
}

interface RoleAddCredentials {
    name: string;
    permission: PermissionSchema[];
}

interface RoleEditCredentials extends RoleAddCredentials {
    status: BaseStatus;
}

type RolePageSearch = WithPageQuery<Partial<{
    name: string;
}>>
