const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Artist Disco API',
            version: '2.0.0',
            description: 'REST API for Artist Disco - Discover artists through Spotify integration',
            contact: {
                name: 'Shoha Tsuchida',
                url: 'https://github.com/smtsuchi/artistDiscoExpressBackend'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'http://localhost:5000/api',
                description: 'Development server (API v1)'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['user_id', 'access_token'],
                    properties: {
                        user_id: {
                            type: 'string',
                            description: 'Spotify user ID',
                            example: 'spotify_user_123'
                        },
                        access_token: {
                            type: 'string',
                            description: 'Spotify API access token',
                            example: 'BQA1234...'
                        },
                        my_playlist: {
                            type: 'string',
                            description: 'User playlist ID',
                            example: 'playlist_abc'
                        },
                        category_names: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of category names'
                        },
                        settings: {
                            $ref: '#/components/schemas/Settings'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Settings: {
                    type: 'object',
                    properties: {
                        fav_on_like: {
                            type: 'boolean',
                            description: 'Automatically favorite artist on like',
                            default: true
                        },
                        follow_on_like: {
                            type: 'boolean',
                            description: 'Automatically follow artist on like',
                            default: true
                        },
                        add_to_playlist_on_like: {
                            type: 'boolean',
                            description: 'Automatically add to playlist on like',
                            default: true
                        },
                        current_playlist: {
                            type: 'string',
                            description: 'Current active category/playlist',
                            nullable: true
                        }
                    }
                },
                Category: {
                    type: 'object',
                    required: ['category_name'],
                    properties: {
                        category_name: {
                            type: 'string',
                            description: 'Name of the category',
                            example: 'Electronic'
                        },
                        first_time: {
                            type: 'boolean',
                            description: 'Whether category has been initialized',
                            default: true
                        },
                        artists: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Artist' }
                        },
                        buffer: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Queue of artist IDs to process'
                        },
                        liked_count: {
                            type: 'number',
                            default: 0
                        },
                        liked: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        used: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        visited: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        childRefs: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    artist_id: { type: 'string' },
                                    depth: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                Artist: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        genres: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        popularity: { type: 'number' },
                        followers: {
                            type: 'object',
                            properties: {
                                total: {
                                    type: 'number',
                                    description: 'Total number of followers'
                                }
                            }
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string' },
                                    height: { type: 'number' },
                                    width: { type: 'number' }
                                }
                            }
                        },
                        external_urls: {
                            type: 'object',
                            properties: {
                                spotify: { type: 'string' }
                            }
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'string',
                            example: 'Error message'
                        },
                        details: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints'
            },
            {
                name: 'Users',
                description: 'User management endpoints'
            },
            {
                name: 'Categories',
                description: 'Category management endpoints'
            },
            {
                name: 'Settings',
                description: 'User settings endpoints'
            }
        ]
    },
    apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
