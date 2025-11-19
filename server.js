const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Spotify OAuth configuration (for future use)
// const client_id = process.env.client_id;
// const client_secret = process.env.client_secret;
// const redirect_uri = process.env.redirect_uri;

// App Config
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(__dirname + '/public'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Artist Disco API Docs'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Artist Disco API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Artist Disco API is running',
        timestamp: new Date().toISOString()
    });
});

// Legacy test endpoint (for backward compatibility)
app.get('/test', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'API test successful'
    });
});

// API Routes (new modern structure)
app.use('/api/users', userRoutes);

// Category routes are nested under users
app.use('/api/users/:user_id/categories', (_req, _res, next) => {
    next();
}, categoryRoutes);

// Legacy routes (for backward compatibility during migration)
// These route to the new controllers but maintain old endpoints

// Legacy user routes
app.post('/userData', require('./controllers/userController').createUser);
app.get('/userData/:user_id', require('./controllers/userController').getUserById);
app.get('/userData/settings/:user_id', require('./controllers/userController').getUserSettings);

// Legacy category routes
app.post('/category/:user_id', require('./controllers/categoryController').createCategory);
app.get('/category/:user_id/:category_name', require('./controllers/categoryController').getCategoryByName);
app.get('/category/single/:user_id/:category_name', require('./controllers/categoryController').getCurrentArtist);
app.post('/patch-category/:user_id/:category_name', require('./controllers/categoryController').updateCategory);
app.post('/patch-category-liked/:user_id/:category_name', require('./controllers/categoryController').addLikedArtist);
app.post('/patch-category-leave-screen/:user_id/:category_name', require('./controllers/categoryController').updateOnLeaveScreen);

// Legacy settings routes (consolidated to new endpoint)
const userController = require('./controllers/userController');

app.post('/atp/:user_id', async (req, res, next) => {
    req.body = { setting: 'add_to_playlist_on_like', value: req.body.value };
    await userController.updateUserSetting(req, res, next);
});

app.post('/fav/:user_id', async (req, res, next) => {
    req.body = { setting: 'fav_on_like', value: req.body.value };
    await userController.updateUserSetting(req, res, next);
});

app.post('/follow/:user_id', async (req, res, next) => {
    req.body = { setting: 'follow_on_like', value: req.body.value };
    await userController.updateUserSetting(req, res, next);
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
    console.log(`Server started on port ${port}`);
});