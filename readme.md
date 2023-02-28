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
`POST /userData`
`GET /userData/<user_id>`
`GET /userData/settings/<user_id>`
#### Categories
`POST /category/<user_id>`
`GET /category/<user_id>/<category_name>`
`GET /category/single/<user_id>/<category_name>`
`POST /patch-category/<user_id>/<category_name>`
`POST /patch-category-liked/<user_id>/<category_name>`
`POST /patch-category-leave-screen/<user_id>/<category_name>`

#### Settings
`POST /atp/<user_id>`
`POST /fav/<user_id>`
`POST /follow/<user_id>`


[//]: # (Thanks for following along! Shoha, out--)