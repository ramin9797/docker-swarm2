const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'my_user',
  host: 'postgres-master',
  database: 'my_database',
  password: 'my_password',
  port: 5432,
});


app.get("create-task",async (req,res)=>{
    // SQL query to create a "tasks" table
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL
    );
    `;

    // Function to execute the create table query
    const createTable = async () => {
    try {
        const client = await pool.connect();
        await client.query(createTableQuery);
        console.log('Table "tasks" created successfully');
        client.release();
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        // Ensure that the connection pool is closed
        await pool.end();
    }
    };

    // Call the createTable function
        createTable();
})


// Add a task
app.post('/tasks', async (req, res) => {
    try {
      const { description } = req.body;
      const result = await pool.query('INSERT INTO tasks (description) VALUES ($1) RETURNING *', [description]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // List all tasks
  app.get('/tasks', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tasks');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
