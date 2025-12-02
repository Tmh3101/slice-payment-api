type UserPayload = {
    email: string;
    scopes: string[];
    jti: string;
    nonce: string;
    iat: number;
    exp: number;
};

export type AppVariables = {
    user: UserPayload;
};