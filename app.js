`const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB database
mongoose
  .connect('mongodb://localhost:27017/fooddb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// Define the Food item schema
const foodSchema = new mongoose.Schema({
  foodName: String,
  foodType: {
    type: String,
    enum: [
      'delicious food',
      'nutritious food',
      'fast food',
      'beverages',
      'dessert',
    ],
  },
  maxDeliveryTime: Number,
  price: Number,
});

// Define the Order schema
const orderSchema = new mongoose.Schema({
  foodId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['Placed', 'Out for Delivery', 'Delivered', 'Cancelled'],
  },
});

// Define the Food and Order models
const Food = mongoose.model('Food', foodSchema);
const Order = mongoose.model('Order', orderSchema);

// Define the endpoints
app.get('/food', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/food/:id', getFood, (req, res) => {
  res.json(res.food);
});

app.get('/food', async (req, res) => {
  const { type, maxdeliverytime } = req.query;
  const filter = {};
  if (type) filter.foodType = type;
  if (maxdeliverytime) filter.maxDeliveryTime = { $lte: maxdeliverytime };

  try {
    const foods = await Food.find(filter);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/food', async (req, res) => {
  const { foodName, foodType, maxDeliveryTime, price } = req.body;
  const food = new Food({
    foodName,
    foodType,
    maxDeliveryTime,
    price,
  });

  try {
    const newFood = await food.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/food/:id', getFood, async (req, res) => {
  const { foodName, foodType, maxDeliveryTime, price } = req.body;
  if (foodName) res.food.foodName = foodName;
  if (foodType) res.food.foodType = foodType;
  if (maxDeliveryTime) res.food.maxDeliveryTime = maxDeliveryTime;
  if (price) res.food.price = price;

  try {
    const updatedFood = await res.food.save();
    res.json(updatedFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/food/:id', getFood, async (req, res) => {
  try {
    await res.food.remove();
    res.json({ message: 'Food item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/food/order', async (req, res) => {
  const { foodId } = req.body;
  const order = new Order({
    foodId,
    status: 'Placed',
  });

  try {
    const neworder = await order.save();
    res.status(201).json(neworder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/food/order/:id', getFood, async (req, res) => {
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
      status: status,
    });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/food/order/cancelled/:id', getFood, async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
      status: status,
    });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/food/orders', async (req, res) => {
  const { status } = req.query;
  const filter = { status: status };

  try {
    const orders = await Order.find(filter);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});