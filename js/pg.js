const { Pool, Client } = require('pg')

/*
const pool = new Pool({
  user: 'jan',
  host: '192.168.1.149',
  database: 'pjb-2021-04-13_1225',
  password: 'Jf3IBqP9',
  port: 5432,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})
*/

const client = new Client({
  user: 'jan',
  host: '192.168.1.149',
  database: 'pjb-2021-04-13_1225',
  password: 'Jf3IBqP9',
  port: 5432,
})

client.connect()

client.query('SELECT id,default_code from product_product', (err, res) => {
  console.log(err, res)
  client.end()
} )
