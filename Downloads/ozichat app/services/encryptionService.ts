
// End-to-End Encryption Service using Web Crypto API (ECDH + AES-GCM)

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
    return await window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey", "deriveBits"]
    );
};

export const deriveSharedKey = async (privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> => {
    return await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: publicKey },
        privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

export const encryptMessage = async (text: string, sharedKey: CryptoKey): Promise<{ cipherText: string; iv: string }> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        sharedKey,
        data
    );

    return {
        cipherText: arrayBufferToBase64(encryptedData),
        iv: arrayBufferToBase64(iv.buffer),
    };
};

export const decryptMessage = async (cipherText: string, iv: string, sharedKey: CryptoKey): Promise<string> => {
    try {
        const encryptedData = base64ToArrayBuffer(cipherText);
        const ivData = base64ToArrayBuffer(iv);

        const decryptedData = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivData) },
            sharedKey,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    } catch (e) {
        console.error("E2EE Decryption Error:", e);
        return "[Decryption Error: Identity Mismatch]";
    }
};

/**
 * Generates a unique "Safety Number" or fingerprint for the conversation.
 * In a real app, this is derived from both parties' public keys.
 */
export const generateSafetyNumber = async (id1: string, id2: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(id1 + id2);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(10).padStart(3, '0')).join('');
    // Format into a Signal-style number sequence
    return hashHex.match(/.{1,5}/g)?.slice(0, 12).join(' ') || "00000 00000";
};

// --- Singleton Session State ---
let currentUserKeyPair: CryptoKeyPair | null = null;
const contactPublicKeyCache: Map<string, CryptoKey> = new Map();
const sharedSecretCache: Map<string, CryptoKey> = new Map();

export const getSharedSecretForChat = async (contactId: string): Promise<CryptoKey | null> => {
    if (!currentUserKeyPair) {
        currentUserKeyPair = await generateKeyPair();
    }
    
    if (sharedSecretCache.has(contactId)) {
        return sharedSecretCache.get(contactId)!;
    }

    // Stable identity mapping - simulated public key for the remote contact
    let contactPublicKey = contactPublicKeyCache.get(contactId);
    if (!contactPublicKey) {
        const contactPair = await generateKeyPair();
        contactPublicKey = contactPair.publicKey;
        contactPublicKeyCache.set(contactId, contactPublicKey);
    }

    const sharedKey = await deriveSharedKey(currentUserKeyPair.privateKey, contactPublicKey);
    sharedSecretCache.set(contactId, sharedKey);
    return sharedKey;
};
