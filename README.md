# Ink&Panels - Premium Manga Store

A full-stack e-commerce website for selling manga, built with Node.js, Express, MongoDB, and modern frontend technologies.

## Features

- User authentication and authorization
- Browse and search manga catalog
- Shopping cart functionality
- Secure payment processing with Stripe
- Order management system
- User wishlist
- Admin panel for manga management
- Responsive design
- Image upload and storage with Cloudinary

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- Cloudinary for image storage

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Stripe Elements
- Font Awesome icons

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account
- Cloudinary account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ink-panels.git
cd ink-panels
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Visit http://localhost:5000 in your browser

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Manga
- GET /api/manga - Get all manga
- GET /api/manga/:id - Get manga by ID
- POST /api/manga - Create new manga (Admin only)
- PUT /api/manga/:id - Update manga (Admin only)
- DELETE /api/manga/:id - Delete manga (Admin only)

### Orders
- GET /api/orders/my-orders - Get user's orders
- POST /api/orders - Create new order
- PUT /api/orders/:id/status - Update order status

### Users
- GET /api/users/me - Get user profile
- PUT /api/users/me - Update user profile
- POST /api/users/wishlist/:mangaId - Add manga to wishlist
- DELETE /api/users/wishlist/:mangaId - Remove manga from wishlist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.