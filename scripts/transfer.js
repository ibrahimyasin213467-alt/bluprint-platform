const { Connection, Keypair, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } = require('@solana/web3.js');
const fs = require('fs');

async function transfer() {
    try {
        // Gönderen cüzdan (wallet.json)
        const secretKey = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
        const fromWallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
        
        // Alan cüzdan (Phantom)
        const toWallet = new PublicKey('aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x');
        
        // Bağlantı
        const connection = new Connection('http://localhost:8899', 'confirmed');
        
        console.log('📤 Gönderen:', fromWallet.publicKey.toBase58());
        console.log('📥 Alan:', toWallet.toBase58());
        
        // Transfer işlemi
        const transferIx = SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: toWallet,
            lamports: 5 * LAMPORTS_PER_SOL
        });
        
        // Transaction oluştur
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromWallet.publicKey;
        transaction.add(transferIx);
        
        // İmzala ve gönder
        transaction.sign(fromWallet);
        const signature = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction(signature);
        
        console.log('✅ 5 SOL transfer edildi!');
        console.log('🔗 İşlem:', signature);
        
        // Bakiyeyi kontrol et
        const balance = await connection.getBalance(toWallet);
        console.log('💰 Phantom bakiye:', balance / LAMPORTS_PER_SOL, 'SOL');
        
    } catch (err) {
        console.error('❌ Hata:', err.message);
    }
}

transfer();