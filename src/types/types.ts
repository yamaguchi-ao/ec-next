export type UserType = {
    id?: number,
    username: string,
    admin?: boolean
}

export type ProductType = {
    id?: string;
    name?: string;
    category: { name: string } | null;
    count?: number;
    price?: number;
    description?: string | null;
    is_on_sale?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type FieldErrors = {
    username?: string[];
    email?: string[];
    password?: string[];
    confirm?: string[];
}