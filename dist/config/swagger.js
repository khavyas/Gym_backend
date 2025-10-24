const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gym Backend API',
            version: '1.0.0',
            description: 'API documentation for Gym Management System',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 10000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
                bearerAuth: [],
            }],
    },
    apis: [
        './routes/*.js',
        './models/*.js',
    ],
};
const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
