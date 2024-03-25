import crypto from 'node:crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')

const pub = publicKey.export({ type: 'spki', format: 'pem' }).toString()
const pri = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

const bufferPublicKey = Buffer.from(pub, 'utf-8');
const bufferPrivateKey = Buffer.from(pri, 'utf-8');

console.log('public:');
console.log(bufferPublicKey.toString('base64'));

console.log('private:');
console.log(bufferPrivateKey.toString('base64'));
