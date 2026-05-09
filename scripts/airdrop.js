const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

async function airdrop() {
    const secretKey = JSON.parse(fs.readFileSync('wallet.json'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    const connection = new Connection('http://localhost:8899', 'confirmed');
    
    console.log('💰 Cüzdan:', wallet.publicKey.toBase58());
    console.log('⏳ Airdrop isteniyor...');
    
    const signature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`✅ Bakiye: ${balance / LAMPORTS_PER_SOL} SOL`);
}

airdrop();