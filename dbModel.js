const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const categorySchema = mongoose.Schema({
    category_name: reqString,
    first_time: Boolean,
    artists: [Object],
    buffer: [String],
    liked_count: Number,
    liked: [String],
    used: [String],
    visited: [String],
    childRefs: [Object]
})

const userSchema = mongoose.Schema({
    user_id: reqString,
    access_token: String,
    category_data: [categorySchema],
    category_names: [String],
    my_playlist: String,
    settings: {
        fav_on_like: Boolean,
        follow_on_like: Boolean,
        add_to_playlist_on_like: Boolean,
        current_playlist: String
    }
})

module.exports = mongoose.model("userData", userSchema)