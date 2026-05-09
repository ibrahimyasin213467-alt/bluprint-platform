const express = require('express');
const { Connection, Keypair, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } = require('@solana/web3.js');
const { createInitializeMintInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Solana bağlantısı (localhost test için)
const connection = new Connection('http://localhost:8899', 'confirmed');

// Fee ve hazine cüzdanı
const FEE_AMOUNT = 0.25 * LAMPORTS_PER_SOL;
const TREASURY_WALLET = new PublicKey("Hn5UBz1BSDNzJVwbTx3KAK64gFBwtWoAaFbg2jCg6Vq5");

// Backend cüzdanı (fee'lerin toplanacağı cüzdan)
let treasuryWallet;
if (fs.existsSync('wallet.json')) {
    const secretKey = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
    treasuryWallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
} else {
    treasuryWallet = Keypair.generate();
    fs.writeFileSync('wallet.json', JSON.stringify(Array.from(treasuryWallet.secretKey)));
}
console.log('💰 Hazine Cüzdanı:', treasuryWallet.publicKey.toBase58());

// Token oluşturma API'si
app.post('/create-token', async (req, res) => {
    try {
        const { userPublicKey, name, symbol, supply, imageUrl } = req.body;
        const userPubkey = new PublicKey(userPublicKey);
        
        console.log('\n🚀 Token oluşturma isteği geldi!');
        console.log(`📝 İsim: ${name} | Sembol: ${symbol}`);
        console.log(`📊 Arz: ${supply} | 👤 Kullanıcı: ${userPublicKey}`);
        
        // 1. Mint keypair oluştur
        const mintKeypair = Keypair.generate();
        
        // 2. Rent lamports hesapla
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        
        // 3. Create account instruction
        const createAccountIx = SystemProgram.createAccount({
            fromPubkey: userPubkey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID
        });
        
        // 4. Initialize mint instruction (6 decimals)
        const initMintIx = createInitializeMintInstruction(
            mintKeypair.publicKey,
            6,
            userPubkey,
            userPubkey
        );
        
        // 5. Fee transfer instruction (backend cüzdanına)
        const feeIx = SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: treasuryWallet.publicKey,
            lamports: FEE_AMOUNT
        });
        
        // 6. Transaction oluştur
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubkey;
        transaction.add(createAccountIx, initMintIx, feeIx);
        
        // 7. Mint keypair'i kısmi imzala
        transaction.partialSign(mintKeypair);
        
        // 8. Frontend'e gönder
        const serializedTx = transaction.serialize({ requireAllSignatures: false }).toString('base64');
        
        console.log('✅ Transaction hazır, frontend\'e gönderiliyor...');
        
        res.json({
            success: true,
            transaction: serializedTx,
            mintAddress: mintKeypair.publicKey.toBase58()
        });
        
    } catch (error) {
        console.error('❌ Hata:', error.message || error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Transaction preparation failed'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server başlat
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n🚀 BluPrint Token Creator Server');
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`💰 Fee: 0.25 SOL`);
    console.log(`🏦 Hazine: ${treasuryWallet.publicKey.toBase58()}`);
    console.log(`🔗 Solana: ${connection.rpcEndpoint}\n`);
});