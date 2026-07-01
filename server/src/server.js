const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const menu = {
  pizzas: [
    { id: 'margherita', name: 'Margherita', price: 35 },
    { id: 'vegetarian', name: 'Vegetarian', price: 39 },
    { id: 'pepperoni', name: 'Pepperoni', price: 42 }
  ],
  sizes: [
    { id: 'small', name: 'Small', price: 0 },
    { id: 'medium', name: 'Medium', price: 8 },
    { id: 'large', name: 'Large', price: 15 }
  ],
  toppings: [
    { id: 'olives', name: 'Olives', price: 4 },
    { id: 'mushrooms', name: 'Mushrooms', price: 4 },
    { id: 'corn', name: 'Corn', price: 4 },
    { id: 'onion', name: 'Onion', price: 4.5 },
    { id: 'extra_cheese', name: 'Extra Cheese', price: 3.5 }
  ]
};

const orders = [];
let nextOrderId = 1;

const allowedStatuses = ['new', 'preparing', 'ready', 'delivered'];
const nextAllowedStatus = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'delivered'
};

function findById(items, id) {
  return items.find((item) => item.id === id);
}

function createError(message) {
  return { error: message };
}

function validateOrderBody(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  const { customerName, phone, deliveryAddress, pizzas } = body;

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    return 'customerName is required';
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return 'phone is required';
  }

  if (!deliveryAddress || typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
    return 'deliveryAddress is required';
  }

  if (!Array.isArray(pizzas) || pizzas.length === 0) {
    return 'At least one pizza is required';
  }

  for (const pizza of pizzas) {
    if (!pizza || typeof pizza !== 'object') {
      return 'Each pizza must be an object';
    }

    if (!findById(menu.pizzas, pizza.pizzaId)) {
      return `Invalid pizzaId: ${pizza.pizzaId}`;
    }

    const size = findById(menu.sizes, pizza.sizeId);
    if (!size) {
      return `Invalid sizeId: ${pizza.sizeId}`;
    }

    const toppings = Array.isArray(pizza.toppingIds) ? pizza.toppingIds : [];

    if (toppings.length > 3) {
      return 'A pizza cannot have more than three toppings';
    }

    for (const toppingId of toppings) {
      if (!findById(menu.toppings, toppingId)) {
        return `Invalid toppingId: ${toppingId}`;
      }
    }

    // Personal rule for submitter ID ending with 4:
    // A large pizza must include at least one topping.
    if (size.id === 'large' && toppings.length === 0) {
      return 'Personal rule: a large pizza must include at least one topping';
    }
  }

  return null;
}

function calculatePizzaPrice(pizza) {
  const menuPizza = findById(menu.pizzas, pizza.pizzaId);
  const size = findById(menu.sizes, pizza.sizeId);
  const toppingIds = Array.isArray(pizza.toppingIds) ? pizza.toppingIds : [];
  const toppings = toppingIds.map((id) => findById(menu.toppings, id));

  const toppingsTotal = toppings.reduce((sum, topping) => sum + topping.price, 0);
  const subtotal = menuPizza.price + size.price + toppingsTotal;

  return {
    pizzaId: menuPizza.id,
    pizzaName: menuPizza.name,
    pizzaPrice: menuPizza.price,
    sizeId: size.id,
    sizeName: size.name,
    sizePrice: size.price,
    toppings: toppings.map((topping) => ({
      toppingId: topping.id,
      name: topping.name,
      price: topping.price
    })),
    subtotal
  };
}

function buildOrder(body) {
  const pricedPizzas = body.pizzas.map(calculatePizzaPrice);
  const totalPrice = pricedPizzas.reduce((sum, pizza) => sum + pizza.subtotal, 0);

  return {
    orderId: String(nextOrderId++),
    customerName: body.customerName.trim(),
    phone: body.phone.trim(),
    deliveryAddress: body.deliveryAddress.trim(),
    pizzas: pricedPizzas,
    totalPrice,
    status: 'new',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString()
  };
}

app.get('/api/menu', (req, res) => {
  res.status(200).json(menu);
});

app.post('/api/orders', (req, res) => {
  const validationError = validateOrderBody(req.body);
  if (validationError) {
    return res.status(400).json(createError(validationError));
  }

  const order = buildOrder(req.body);
  orders.push(order);
  return res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(200).json(orders);
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json(createError('Invalid status filter'));
  }

  const filteredOrders = orders.filter((order) => order.status === status);
  return res.status(200).json(filteredOrders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((item) => item.orderId === req.params.id);
  if (!order) {
    return res.status(404).json(createError('Order not found'));
  }

  return res.status(200).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find((item) => item.orderId === req.params.id);
  if (!order) {
    return res.status(404).json(createError('Order not found'));
  }

  const { status } = req.body || {};
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json(createError('status must be one of: new, preparing, ready, delivered'));
  }

  if (order.status === 'delivered') {
    return res.status(409).json(createError('Delivered order cannot be changed'));
  }

  if (nextAllowedStatus[order.status] !== status) {
    return res.status(409).json(createError(`Illegal status transition from ${order.status} to ${status}`));
  }

  order.status = status;
  return res.status(200).json(order);
});

app.use((req, res) => {
  res.status(404).json(createError('Route not found'));
});

app.listen(PORT, () => {
  console.log(`Pizza ordering server is running on port ${PORT}`);
});
