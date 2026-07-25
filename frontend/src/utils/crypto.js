export const generateKeypair = async () => {
  const sodium = await import('libsodium-wrappers');
  await sodium.ready;
  const keypair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keypair.publicKey),
    privateKey: sodium.to_base64(keypair.privateKey),
    keyType: 'curve25519',
  };
};

export const encryptMessage = async (publicKeyBase64, privateKeyBase64, message) => {
  const sodium = await import('libsodium-wrappers');
  await sodium.ready;

  const recipientPublicKey = sodium.from_base64(publicKeyBase64);
  const senderPrivateKey = sodium.from_base64(privateKeyBase64);

  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(message),
    nonce,
    recipientPublicKey,
    senderPrivateKey
  );

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
  };
};

export const decryptMessage = async (publicKeyBase64, privateKeyBase64, ciphertextBase64, nonceBase64) => {
  const sodium = await import('libsodium-wrappers');
  await sodium.ready;

  const senderPublicKey = sodium.from_base64(publicKeyBase64);
  const recipientPrivateKey = sodium.from_base64(privateKeyBase64);
  const ciphertext = sodium.from_base64(ciphertextBase64);
  const nonce = sodium.from_base64(nonceBase64);

  const decrypted = sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    senderPublicKey,
    recipientPrivateKey
  );

  return sodium.to_string(decrypted);
};

export const storePrivateKey = async (privateKey) => {
  try {
    const db = await openDB();
    const tx = db.transaction('keys', 'readwrite');
    tx.objectStore('keys').put({ id: 'privateKey', value: privateKey });
    await tx.done;
  } catch (error) {
    console.error('Failed to store private key:', error);
  }
};

export const getPrivateKey = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction('keys', 'readonly');
    const result = await tx.objectStore('keys').get('privateKey');
    await tx.done;
    return result?.value || null;
  } catch (error) {
    console.error('Failed to retrieve private key:', error);
    return null;
  }
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SecureConnectKeys', 1);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore('keys', { keyPath: 'id' });
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};
