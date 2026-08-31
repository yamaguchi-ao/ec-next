export type UserType = {
    id: number,
    username: string,
    admin?: boolean,
    address?: {
        postCode: string,
        address1: string,
        address2: string,
        phone: string
    }
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

export type FormState = {
    success: boolean
    message: string
    fieldErrors?: Record<string, string[] | undefined>
}
