export type Crypto = {
    encrypt: (data: string) => string;
    decrypt: (encryptedData: string) => string;
};
export declare const createCrypto: (key?: string) => Crypto;
