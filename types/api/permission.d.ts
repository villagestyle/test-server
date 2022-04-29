type PermissionSchema = WithTimer<PermissionEditCredentials>;

interface PermissionAddCredentials {
  permissionStr: string;
  routerLink: string;
  icon: string;
  sort: number;
}

type PermissionEditCredentials = {
  status: BaseStatus;
} & PermissionAddCredentials;

type PermissionPageSearch = WithPageQuery<Partial<{
    permissionStr: string;
}>>