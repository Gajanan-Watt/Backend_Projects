const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'url_shortener',
    user: 'gajananwattamwar'
});

const sampleData = [
    ['https://www.example.com/very/long/url/1', 'abc123'],
    ['https://www.anotherexample.com/even/longer/url/2', 'def456'],
    ['https://www.thirdexample.com/also/very/long/3', 'ghi789']
];

async function insertSampleData(){
    try {
        await client.connect();

        for(const [original_url, short_code] of sampleData){
            await client.query(
                'INSERT INTO url_shortener (original_url, short_code) VALUES ($1, $2)',
                [original_url, short_code]
            );
        }

        const res = await client.query('SELECT * FROM url_shortener');
        console.log("Inserted rows: ", res.rows);
    } catch(err) {
        console.log("Error: ", err);
    } finally {
        await client.end();
    }
}


insertSampleData();