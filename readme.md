# Artist Disco - REST API Back End
This is an NodeJs and ExpressJS powered application providing a REST API to a MongoDB-backed Model. This is meant to be used by the React front end application found here: [Artist Disco Front End](https://github.com/smtsuchi/artistDiscoReactFrontend)


The entire application is contained within the `server.js` file.


## Install

    npm install

## Run the app

    node server.js

# REST API

The REST API to the example app is described below.

### List of Endpoints
#### User
`POST /userData`<br>
`GET /userData/<user_id>`<br>
`GET /userData/settings/<user_id>`<br>
#### Categories
`POST /category/<user_id>`<br>
`GET /category/<user_id>/<category_name>`<br>
`GET /category/single/<user_id>/<category_name>`<br>
`POST /patch-category/<user_id>/<category_name>`<br>
`POST /patch-category-liked/<user_id>/<category_name>`<br>
`POST /patch-category-leave-screen/<user_id>/<category_name>`<br>

#### Settings
`POST /atp/<user_id>`<br>
`POST /fav/<user_id>`<br>
`POST /follow/<user_id>`<br>


[//]: # (Thanks for following along! Shoha, out--)