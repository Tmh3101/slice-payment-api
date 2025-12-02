import fs from 'node:fs';
import path from 'node:path';
import { jwtVerify } from "jose";

const getPublicKey = () => {
    try {
        const keyPath = path.resolve(
            process.cwd(),
            'certs',
            'dnpay_public.pem'
        );
        return fs.readFileSync(keyPath, 'utf-8');
    } catch (error) {
        throw new Error('Could not load public key file');
    }
};

const pemToBinary = (pem: string): ArrayBuffer => {
    const b64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/g, "")
        .replace(/-----END PUBLIC KEY-----/g, "")
        .replace(/\s+/g, "");
    
    const binary = atob(b64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return array.buffer;
}

export const verifyToken = async (token: string) => {
    try {
        const pemString = getPublicKey();
        const publicKey = await crypto.subtle.importKey(
            "spki",
            pemToBinary(pemString),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        );
        const { payload } = await jwtVerify(token, publicKey); 
        return payload;
    } catch (error) {
        throw error;
    }
}