const fetch = require('node-fetch')
const express = require("express")
const cheerio = require('cheerio');
const axios = require('axios');
const pretty = require("pretty");
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
    movieData.pg = await pgScrape(movieData.pgLink)
    console.log(movieData.pg)
    console.log('movie data is', movieData);
    res.render("index.ejs", movieData);
});

async function tmdbreq(name, year) {
    const movieData = {
        name: null,
        id: null,
        posterLink: null,
        pgLink: null,
        imdbId: null
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
        movieData.imdbId = imdbId;

        movieData.pgLink = `https://www.imdb.com/title/${imdbId}/parentalguide`;
        return movieData;
    } catch (err) {
        console.error('error:' + err);
    }

    return movieData
}


async function pgScrape(link){

    pgData = {
        advisoryNudity: null,
        advisoryViolence: null,
        advisoryProfanity: null,
        advisoryAlcohol: null,
        advisoryFrightening: null,
    }

    const res = await fetch(link);
    const html = await res.text();
    const $ = cheerio.load(html);
    nuditySection = $('#advisory-nudity')
    mess = nuditySection.find('.advisory-severity-vote__message').parent().find('span').text()
    if (mess.includes('None')){
        pgData.advisoryNudity = 'None'
    } else if (mess.includes('Mild')){
        pgData.advisoryNudity = 'Mild'
    } else if (mess.includes('Moderate')){ 
        pgData.advisoryNudity = 'Moderate'
    } else if (mess.includes('Severe')){
        pgData.advisoryNudity = 'Severe'
    }

    return pgData;
}

app.listen(3000, () => {
    console.log("Server started on port 3000");
});



