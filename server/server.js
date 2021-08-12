require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db')
const morgan = require('morgan');
const app = express();

// middleware

app.use(cors());
app.use(express.json());


// Get all restaurants
app.get("/api/v1/restaurants", async (req, res) => {
  try {
    // const results = await db.query('SELECT * FROM restaurants');
    const restaurantRatingData = await db.query('SELECT * FROM restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews. restaurant_id;'
    );

    res.status(200).json({
      status: "success",
      results: restaurantRatingData.rows.length,
      data: {
        restaurants: restaurantRatingData.rows
      }
    })

  } catch (err) {
    console.error(err.message);
  }
})

// Get a restaurant

app.get("/api/v1/restaurants/:id", async (req,res) => {

  try {
    const restaurant = await db.query('SELECT * FROM restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews. restaurant_id WHERE id = $1;',
    [req.params.id]);
    const reviews = await db.query('SELECT * FROM reviews WHERE restaurant_id = $1', [req.params.id]);

    res.status(200).json({
      status: "Success",
      results: restaurant.rows.length,
      data: {
        restaurant: restaurant.rows[0],
        reviews: reviews.rows
      },
    });
  } catch (err) {
    console.log(err.message)
  }

});

// Create a Restaurant

app.post("/api/v1/restaurants/", async (req, res) => {
  try {
    const results = await db.query('INSERT INTO restaurants (name, location, price_range) VALUES($1, $2, $3) RETURNING *', [req.body.name, req.body.location, req.body.price_range])
    console.log(results);
    res.status(201).json({
      status: "Success",
      data: {
        restaurant: results.rows[0]
      }
    });
  } catch (err) {
    console.log(err.message);
  }
})


// Update Restaurant

app.put("/api/v1/restaurants/:id", async (req, res) => {
  try {
    let results = await db.query('UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 RETURNING *', [
      req.body.name, req.body.location, req.body.price_range, req.params.id
    ]);
    res.status(200).json({
      status: "Success",
      data: {
        restaurant: results.rows[0]
      }
    });
  } catch (err) {
    console.log(err.message);
  }
});

//  Delete Restaurants

app.delete("/api/v1/restaurants/:id", async (req,res) => {

  try {
    let results = await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);
    res.status(204).json({
      status: "Success"
    });
  } catch (err) {
    console.log(err.message);
  }
});


// Add review

app.post("/api/v1/restaurants/:id/addReview", async (req,res) => {
  try {
    const newReview = await db.query(
      "INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *;",
      [req.params.id, req.body.name, req.body.review, req.body.rating])
    console.log("logReview: ", newReview);
    res.status(201).json({
      status: "success",
      data: {
        review: newReview.rows[0]
      }
    });
  } catch (err) {
    console.log(err)
  }
})


const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`server starting on port ${port}`);
});