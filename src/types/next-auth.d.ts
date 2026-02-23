```typescript
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role?: "ADMIN" | "MANAGER_SALES" | "SALES" | "FINANCE" | "NOC" | "MANAGER_TECH" | "TECH_SUPPORT" | string;
        tenantId?: string;
        tenantName?: string;
    }

    interface Session {
        user: User & {
            id: string;
            role?: "ADMIN" | "MANAGER_SALES" | "SALES" | "FINANCE" | "NOC" | "MANAGER_TECH" | "TECH_SUPPORT" | string;
            tenantId?: string;
            tenantName?: string;
        };
    }
}
```
