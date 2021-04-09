const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')

dotenv.config()

const client_id = process.env.client_id; // Your client id
const client_secret = process.env.client_secret; // Your secret
const redirect_uri = process.env.redirect_uri; // Your redirect uri

const User =  require("./dbModel")



/**
* Generates a random string containing numbers and letters
* @param  {number} length The length of the string
* @return {string} The generated string
*/
let generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
  
let stateKey = 'spotify_auth_state';

// App Config
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser())
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json({extended: true}));

//DB Config
const connection_url = 'mongodb+srv://admin:1UznzdSkKG5Zyg24@cluster0.hu4ym.mongodb.net/artistDiscoDB?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true    
})

// API Endpoints
app.get('/', (req,res) => {
    res.status(200).send("Hello World")
})

app.get('/test', (req,res) => {
    res.status(200).json({
        message: "Got passed the test!",
        test: {"test1": "test2"}
    })
})

// Create/Get User Data
app.post('/userData', (req, res, next) => {
    // console.log(req)
    // console.log(req.body);
    const user = new User({
        user_id: req.body.user_id,
        my_playlist: req.body.my_playlist,
        access_token: req.body.access_token,
        category_names: [],
        settings: {
            fav_on_like: true,
            follow_on_like: true,
            add_to_playlist_on_like: true,
            current_playlist: null
        }
    });
    user
        .save()
        .then(result => {
            // console.log(result)
            res.status(201).json({
                message: "Handling POST requests to /userData",
                createdUser: user
            })
        })
        .catch(err => {
            // console.log(err)
            res.status(500).json({
                error: err
            })
        })
    
});

app.get('/userData/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            // console.log('doc: ', doc);
            if (doc) {
                res.status(200).json(doc)
            } else {
                res.status(404).json(doc)
            }
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        })
});

app.get('/userData/settings/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            // console.log('doc: ', doc);
            if (doc) {
                res.status(200).json(doc.settings)
            } else {
                res.status(404).json(doc)
            }
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        })
});

// Create/Get Categories
app.post('/category/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.body.category_name;
    const buffer = req.body.buffer
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            doc.category_data.push({
                category_name: category_name,
                first_time: true,
                artists: [],
                buffer: buffer.split(','),
                liked_count: 0,
                liked: [],
                used: [],
                visited: [],
                childRefs: [] 
            });
            doc.category_names.push(category_name);
            doc.settings.current_playlist = category_name;
            doc.save()
                .then(result => {
                    // console.log(result)
                    res.status(201).json({
                        message: "Handling POST requests to /category",
                        createdCategory: doc.category_data,
                        updatedCategoryList: doc.category_names
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

app.get('/category/:user_id/:category_name', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.params.category_name;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            let categories = doc.category_data;
            let pointer=0;
            for (let i=0; i<categories.length; i++) {
                if (categories[i].category_name == category_name) {
                    pointer=i;
                    break
                }
            }
            if (categories[pointer].category_name == category_name) {
                // console.log(categories[pointer]);
                doc.settings.current_playlist = category_name
                doc.save()
                    .then(
                        res.status(200).json({
                        message: "Handling GET requests to /category/:user_id/:category_name",
                        myCategory: categories[pointer]
                        })
                    )
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })
            }
            else {
                res.status(404).json(categories[pointer])
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

app.get('/category/single/:user_id/:category_name', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.params.category_name;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            let categories = doc.category_data;
            let pointer=0;
            let indiv = {};
            for (let i=0; i<categories.length; i++) {
                if (categories[i].category_name == category_name) {
                    pointer=i;
                    break
                }
            }
            
            indiv = categories[pointer].artists[categories[pointer].artists.length-1];
            
            res.status(200).json({
                message: "Handling GET requests to /category/single/:user_id/:category_name",
                individual_card: indiv
            })
            
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

// Update specific category from getRelatedArtists
app.post('/patch-category/:user_id/:category_name', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.params.category_name;
    const artists = req.body.artists;
    const used = req.body.used;
    const child_refs = req.body.child_refs;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            // console.log('request: ', req.body)
            let categories = doc.category_data;
            let pointer = 0;
            for (let i=0; i<categories.length; i++) {
                if (categories[i].category_name == category_name) {
                    pointer=i;
                    break
                }
            }
            let myCategory = doc.category_data[pointer];
            myCategory.first_time = false;
            myCategory.artists = artists;
            myCategory.used = used;
            myCategory.childRefs = child_refs;

            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /patch-category",
                        updatedCategory: result.category_data[pointer],
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        message: 'hi',
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: 'hello',
                error: err
            })
        })

});

app.post('/patch-category-liked/:user_id/:category_name', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.params.category_name;
    const artist_id = req.body.artist_id;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            // console.log('request: ', req.body)
            let categories = doc.category_data;
            let pointer = 0;
            for (let i=0; i<categories.length; i++) {
                if (categories[i].category_name == category_name) {
                    pointer=i;
                    break
                }
            }
            let myCategory = doc.category_data[pointer];
            myCategory.liked.push(artist_id)

            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /patch-category-liked",
                        updatedLiked: result.category_data[pointer].liked,
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        message: 'hi',
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: 'hello',
                error: err
            })
        })

});

app.post('/patch-category-leave-screen/:user_id/:category_name', (req,res) => {
    const user_id = req.params.user_id;
    const category_name = req.params.category_name;
    const visited = req.body.visited;
    const artists = req.body.artists;
    // console.log(visited)
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            // console.log('request: ', req.body)
            let categories = doc.category_data;
            let pointer = 0;
            for (let i=0; i<categories.length; i++) {
                if (categories[i].category_name == category_name) {
                    pointer=i;
                    break
                }
            }
            let myCategory = doc.category_data[pointer];
            myCategory.visited = visited;
            myCategory.artists = artists;


            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /patch-category-leave-screen",
                        updatedVisited: visited,
                        updatedArtists: result.category_data[pointer].artists
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        message: 'hi',
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: 'hello',
                error: err
            })
        })

});

// Update Settings
app.post('/atp/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    const value = req.body.value;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            doc.settings.add_to_playlist_on_like = value;

            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /atp for current_user",
                        add_to_playlist_on_like: result.settings.add_to_playlist_on_like
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

app.post('/fav/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    const value = req.body.value;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            doc.settings.fav_on_like = value;

            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /atp for current_user",
                        fav_on_like: result.settings.fav_on_like
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

app.post('/follow/:user_id', (req,res) => {
    const user_id = req.params.user_id;
    const value = req.body.value;
    User.findOne({ user_id: user_id })
        .exec()
        .then(doc => {
            doc.settings.follow_on_like = value;

            doc.save()
                .then(result => {
                    // console.log('result: ', result)
                    res.status(201).json({
                        message: "Handling POST requests to /atp for current_user",
                        follow_on_like: result.settings.follow_on_like
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

// Listen
app.listen(port, () => console.log(`Server started on port ${port}`));