const { Client } = require('pg');

function generateShortCode(length = 6){
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateLongUrl(){
    return `https://www.example.com/${generateShortCode(10)}/${generateShortCode(8)}`;
}

async function insertUrls(numRows){
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'url_shortener',
        user: 'gajananwattamwar'
    })

    try{
        await client.connect();

        let date1 = new Date();
        
        for(let i = 0; i < numRows; i++){
            const original_url = generateLongUrl();
            const short_code = generateShortCode();
            await client.query(
                'INSERT INTO url_shortener (original_url, short_code) VALUES ($1, $2)', 
                [original_url, short_code]
            );
        }

        const res = await client.query('SELECT COUNT(*) as count FROM url_shortener');
        console.log(`Total rows: ${res.rows[0].count}`);
        let date2 = new Date();
        console.log(`Time taken: ${date2 - date1} ms`);
    } catch (err) {
        console.log("Error: ", err);
    } finally {
        await client.end();
    }
}

insertUrls(100000);