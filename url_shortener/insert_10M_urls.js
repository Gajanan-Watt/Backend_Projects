const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'url_shortener',
  user: 'gajananwattamwar'
});

const BATCH_SIZE = 10000;
// const TOTAL_ROWS = 10000000;//for 10M rows
const TOTAL_ROWS = 1000000;//for 1M rows

function generateShortCode(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateLongUrl() {
  return `https://www.example.com/${generateShortCode(10)}/${generateShortCode(8)}`;
}

async function batchInsert(client, rows) {
  const values = rows.map(row => `('${row.original_url}', '${row.short_code}')`).join(',');
  const query = `
    INSERT INTO url_shortener (original_url, short_code)
    VALUES ${values}
    ON CONFLICT (short_code) DO NOTHING
  `;
  await client.query(query);
}

async function insertUrls(numRows) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const startTime = Date.now();
    let batchRows = [];

    for (let i = 0; i < numRows; i++) {
      batchRows.push({
        original_url: generateLongUrl(),
        short_code: generateShortCode()
      });

      if (batchRows.length === BATCH_SIZE || i === numRows - 1) {
        await batchInsert(client, batchRows);
        batchRows = [];
        if (i % 100000 === 0) {
          console.log(`Processed ${i} rows`);
        }
      }
    }

    await client.query('COMMIT');

    const res = await client.query('SELECT COUNT(*) as count FROM url_shortener');
    console.log(`Total rows: ${res.rows[0].count}`);
    
    const endTime = Date.now();
    console.log(`Time taken: ${endTime - startTime} ms`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.log("Error: ", err);
  } finally {
    client.release();
  }
}

async function createIndex() {
  const client = await pool.connect();
  try {
    await client.query('CREATE INDEX IF NOT EXISTS idx_short_code ON url_shortener (short_code)');
    console.log('Index created successfully');
  } finally {
    client.release();
  }
}

async function main() {
  await insertUrls(TOTAL_ROWS);
  await createIndex();
  await pool.end();
}

main().catch(console.error);