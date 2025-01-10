using System;

namespace CollabBackend.Core.Interfaces;

public interface IAsymmetricCryptoService
{
    (string PublicKey, string PrivateKey) GenerateKeyPair();
    string EncryptWithPublicKey(string data, string publicKey);
    string DecryptWithPrivateKey(string encryptedData, string privateKey);
} 