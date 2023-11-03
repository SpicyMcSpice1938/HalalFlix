const fetch = require('node-fetch')
const express = require("express")
require('dotenv').config()
const app = express()

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("index.ejs")
})

app.post('/check', async (req, res) => {
    movieData = await tmdbreq(req.body.name, req.body.year)
    console.log('movie data is', movieData);
    res.render("index.ejs", movieData)
});

async function tmdbreq(name, year) {
    const movieData = {
        name: null,
        id: null,
        posterLink: null
    };

    const apiKey = process.env.ACCESSTOKEN;
    const queryName = encodeURIComponent(name);
    const url = `https://api.themoviedb.org/3/search/movie?query=${queryName}&year=${year}`;
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization:`Bearer ${process.env.ACCESSTOKEN}`
        }
    };
    
    try {
        const res = await fetch(url, options);
        const json = await res.json();
        id = json.results[0].id;
        movieData.id = id;
        movieData.posterLink = `https://image.tmdb.org/t/p/w500${json.results[0].poster_path}`;
        movieData.name = json.results[0].title;
        const detailsUrl = `https://api.themoviedb.org/3/movie/${id}/external_ids`;
        const resp = await fetch(detailsUrl, options);
        const json2 = await resp.json();
        const imdbId = json2.imdb_id;
        console.log(`https://www.imdb.com/title/${imdbId}/parentalguide`);
        return movieData;
    } catch (err) {
        console.error('error:' + err);
    }

    return movieData
}







app.listen(3000)



