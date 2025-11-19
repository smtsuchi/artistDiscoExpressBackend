const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

// Artist sub-schema for better type safety
const artistSchema = new mongoose.Schema({
    id: String,
    name: String,
    genres: [String],
    popularity: Number,
    images: [{ url: String, height: Number, width: Number }],
    external_urls: { spotify: String }
}, { _id: false });

// Child reference sub-schema
const childRefSchema = new mongoose.Schema({
    artist_id: String,
    depth: Number
}, { _id: false });

const categorySchema = new mongoose.Schema({
    category_name: reqString,
    first_time: {
        type: Boolean,
        default: true
    },
    artists: [artistSchema],
    buffer: [String],
    liked_count: {
        type: Number,
        default: 0
    },
    liked: [String],
    used: [String],
    visited: [String],
    childRefs: [childRefSchema]
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    user_id: {
        ...reqString,
        unique: true,
        index: true
    },
    access_token: String,
    category_data: [categorySchema],
    category_names: [String],
    my_playlist: String,
    settings: {
        fav_on_like: {
            type: Boolean,
            default: true
        },
        follow_on_like: {
            type: Boolean,
            default: true
        },
        add_to_playlist_on_like: {
            type: Boolean,
            default: true
        },
        current_playlist: String
    }
}, { timestamps: true });

// Index for faster category lookups
userSchema.index({ 'category_data.category_name': 1 });

module.exports = mongoose.model('userData', userSchema);