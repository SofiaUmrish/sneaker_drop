const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is connected!" });
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET || 'sneaker_secret_key_2025', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let role = 'user';

    if (email === 'admin@sneaker.com') {
      role = 'admin';
    }

    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'User registration failed. Email might already exist.' });
  }
});


// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'sneaker_secret_key_2025',
      { expiresIn: '24h' }
    );

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      monthly_budget: user.monthly_budget,
      token: token
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// PUT /api/user/budget
app.put('/api/user/budget', authenticateToken, async (req, res) => {
  const { limit } = req.body;
  const userId = req.user.id;

  try {
    await db.query('UPDATE users SET monthly_budget = $1 WHERE id = $2', [limit, userId]);
    res.json({ message: 'Budget updated successfully', monthly_budget: limit });
  } catch (err) {
    console.error('Update Budget Error:', err);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// PUT /api/user/profile (Update Profile)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  try {
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already in use by another account.' });
    }

    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role',
      [name, email, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});


// GET /api/shoes/soonest 
app.get('/api/shoes/soonest', async (req, res) => {
  try {
    const query = `
      SELECT s.*, b.name as brand_name, c.name as category_name
      FROM shoes s
      LEFT JOIN brands b ON s.brand_id = b.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.release_date >= CURRENT_DATE
      ORDER BY s.release_date ASC
      LIMIT 1
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch Soonest Drop Error:', err);
    res.status(500).json({ error: 'Failed to fetch soonest drop' });
  }
});

// GET /api/brands
app.get('/api/brands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM brands ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Brands Error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Categories Error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/shoes
app.get('/api/shoes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, b.name as brand_name, c.name as category_name
      FROM shoes s
      LEFT JOIN brands b ON s.brand_id = b.id
      LEFT JOIN categories c ON s.category_id = c.id
    `);

    const shoesWithStatus = result.rows.map(shoe => {
      const isUpcoming = new Date(shoe.release_date) > new Date();
      return {
        ...shoe,
        status: isUpcoming ? 'Upcoming' : 'Released'
      };
    });

    res.json(shoesWithStatus);
  } catch (err) {
    console.error('Fetch Shoes Error:', err);
    res.status(500).json({ error: 'Failed to fetch shoes' });
  }
});

// POST /api/shoes 
app.post('/api/shoes', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { model_name, description, price, release_date, image_url, shop_link, brand_id, category_id, sku } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO shoes (model_name, description, price, release_date, image_url, shop_link, brand_id, category_id, sku) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [model_name, description, price, release_date, image_url, shop_link, brand_id, category_id, sku]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add Shoe Error:', err);
    res.status(500).json({ error: 'Failed to add shoe' });
  }
});

// DELETE /api/shoes/:id
app.delete('/api/shoes/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM shoes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shoe not found' });
    }
    res.json({ message: 'Shoe deleted successfully', deletedShoe: result.rows[0] });
  } catch (err) {
    console.error('Delete Shoe Error:', err);
    res.status(500).json({ error: 'Failed to delete shoe' });
  }
});

// PUT /api/shoes/:id
app.put('/api/shoes/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { id } = req.params;
  const { model_name, description, price, release_date, image_url, shop_link, brand_id, category_id, sku } = req.body;

  try {
    const result = await db.query(
      `UPDATE shoes 
       SET model_name=$1, brand_id=$2, category_id=$3, price=$4, image_url=$5, 
           release_date=$6, description=$7, sku=$8, shop_link=$9 
       WHERE id=$10 RETURNING *`,
      [model_name, brand_id, category_id, price, image_url, release_date, description, sku, shop_link, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shoe not found' });
    }

    res.json({ message: 'Shoe updated successfully', updatedShoe: result.rows[0] });
  } catch (err) {
    console.error('Update Shoe Error:', err);
    res.status(500).json({ error: 'Failed to update shoe' });
  }
});

// GET /api/analytics/hype 
app.get('/api/analytics/hype', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const query = `
      SELECT s.id, s.model_name, s.image_url, COUNT(w.shoe_id) as likes_count 
      FROM shoes s 
      LEFT JOIN wishlist w ON s.id = w.shoe_id 
      GROUP BY s.id 
      ORDER BY likes_count DESC 
      LIMIT 5;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Hype Analytics Error:', err);
    res.status(500).json({ error: 'Failed to fetch hype analytics' });
  }
});



// POST /api/reminders
app.post('/api/reminders', authenticateToken, async (req, res) => {
  const { shoe_id } = req.body;
  try {
    await db.query(
      'INSERT INTO reminders (user_id, shoe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, shoe_id]
    );
    res.json({ message: 'Reminder set successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

// GET /api/user/reminders
app.get('/api/user/reminders', authenticateToken, async (req, res) => {
  try {
    const query = `
            SELECT r.id as reminder_id, s.* FROM reminders r
            JOIN shoes s ON r.shoe_id = s.id
            WHERE r.user_id = $1
            ORDER BY s.release_date ASC
        `;
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// DELETE /api/reminders/:id
app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM reminders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Reminder removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove reminder' });
  }
});

// POST /api/wishlist (Add/Remove)
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  const { shoe_id } = req.body;
  const user_id = req.user.id;

  try {
    const checkResult = await db.query('SELECT * FROM wishlist WHERE user_id = $1 AND shoe_id = $2', [user_id, shoe_id]);

    if (checkResult.rows.length > 0) {
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND shoe_id = $2', [user_id, shoe_id]);
      res.json({ message: 'Removed from wishlist' });
    } else {
      await db.query('INSERT INTO wishlist (user_id, shoe_id) VALUES ($1, $2)', [user_id, shoe_id]);
      res.status(201).json({ message: 'Added to wishlist' });
    }
  } catch (err) {
    console.error('Wishlist Update Error:', err);
    res.status(500).json({ error: 'Wishlist update failed' });
  }
});

// GET /api/wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await db.query('SELECT shoe_id FROM wishlist WHERE user_id = $1', [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Wishlist Error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// GET /api/budget/:userId
app.get('/api/budget/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const result = await db.query(`
      SELECT SUM(s.price) as total_budget
      FROM shoes s
      JOIN wishlist w ON s.id = w.shoe_id
      WHERE w.user_id = $1
    `, [userId]);

    res.json({ total_budget: result.rows[0].total_budget || 0 });
  } catch (err) {
    console.error('Budget Calc Error:', err);
    res.status(500).json({ error: 'Failed to calculate budget' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
