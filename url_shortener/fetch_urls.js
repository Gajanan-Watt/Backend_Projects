const { Pool } = require('pg');

async function fetchUrls(numQueries){
    const pool = new Pool({
        host: 'localhost',
        user: 'gajananwattamwar',
        database: 'url_shortener',
        port: 5432
    });

    const query = `SELECT original_url FROM url_shortener
            WHERE short_code IN ('u6uWPC', 'MGo89P', 'Ws2Gou')`
    let date1 = new Date();
    try{
        for(let i = 0; i < numQueries; i++){
            await pool.query(query);
        }
    } catch(err){
        console.log("Error: ", err);
    } finally {
        let date2 = new Date();
        console.log("Time taken: ", date2 - date1, "ms");
        await pool.end();
    }
}

fetchUrls(100000);