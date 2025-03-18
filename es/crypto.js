import CryptoJS from 'crypto-js';
import { Funs } from './funs';
const APP_CRYPTO_SECRET_KEY = Funs.getEnv('CRYPTO_SECRET_KEY', '');
const APP_STORE_PREFIX = Funs.getEnv('STORE_PREFIX', '');
export const createCrypto = function (key) {
    const makeKey = key ?? APP_CRYPTO_SECRET_KEY ?? APP_STORE_PREFIX ?? 'Kysion';
    const cfg = {
        keySize: 128 / 32,
        iv: CryptoJS.enc.Utf8.parse(makeKey),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    };
    const encrypt = (data) => {
        return CryptoJS.AES.encrypt(data, makeKey, cfg).toString();
    };
    const decrypt = (encryptedData) => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, makeKey, cfg);
        return CryptoJS.enc.Utf8.stringify(bytes);
    };
    const result = {
        encrypt,
        decrypt
    };
    return result;
};
