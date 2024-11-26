const crypto = require('crypto');
const EC = require('elliptic').ec;

// Используем кривую secp160r1
const ec = new EC('p192');



// 1. Генерация пары ключей
function generateKeyPair() {
    const keyPair = ec.genKeyPair();
    return {
        publicKey: keyPair.getPublic('hex'), // Открытый ключ в формате hex
        privateKey: keyPair.getPrivate('hex') // Закрытый ключ в формате hex
    };
}

function getKeyPair() {
    return {
        publicKey: "0494df93d5a0fd76031b350c4b8129663e14aa20c60be4991eed474162ec9bfd3a5b159146764a65a91c446a32b126eea8",
        privateKey: "4cbc0f7f22718aa0ccb2d7d0fd3906a271697f01c62d43d6"
    }
}

// 2. Подписать данные с использованием закрытого ключа
function signData(data, privateKeyHex) {
    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
    const hash = Buffer.from(data); // В данном случае просто используем данные напрямую
    const signature = keyPair.sign(hash);
    return signature.toDER('hex'); // Возвращаем подпись в формате DER
}

// 3. Проверить подпись с использованием открытого ключа
function verifyData(data, signatureHex, publicKeyHex) {
    const keyPair = ec.keyFromPublic(publicKeyHex, 'hex');
    const hash = Buffer.from(data); // Данные для проверки
    return keyPair.verify(hash, signatureHex);
}

// 4. Генерация API-ключа
function generateApiKey(payload, privateKey) {
    const token = JSON.stringify(payload); // Данные для API-ключа
    const signature = signData(token, privateKey); // Подписываем токен
    return { token, signature };
}

// 5. Проверка API-ключа
function verifyApiKey(apiKey, publicKey) {
    const { token, signature } = apiKey;
    const isValid = verifyData(token, signature, publicKey); // Проверяем подпись
    if (!isValid) {
        throw new Error('Invalid API Key');
    }
    return JSON.parse(token); // Если ключ валиден, возвращаем данные
}

// Пример работы
const keys = getKeyPair(); // Генерируем пару ключей
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);

// Генерация API-ключа
const payload = { userId: 123, expiresAt: Date.now() + 3600000 }; // Данные API-ключа

const token = JSON.stringify(payload)
const message = Buffer.from(token)

const hash = crypto.createHash('sha1').update(message).digest('hex');
console.log('Short hash (SHA-1):', hash)

const apiKey = generateApiKey(payload, keys.privateKey);
console.log('Generated API Key:', apiKey);

// Проверка API-ключа
try {
    const verifiedPayload = verifyApiKey(apiKey, keys.publicKey);
    console.log('Verified Payload:', verifiedPayload);
} catch (error) {
    console.error('Verification Failed:', error.message);
}
