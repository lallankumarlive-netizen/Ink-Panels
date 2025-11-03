const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.manga')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount } = req.body;

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
            currency: 'usd'
        });

        const order = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            totalAmount,
            paymentIntentId: paymentIntent.id
        });

        await order.save();

        res.json({
            order,
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = orderStatus;
        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Handle Stripe webhook
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Update order payment status
        await Order.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { paymentStatus: 'completed' }
        );
    }

    res.json({ received: true });
});

module.exports = router;