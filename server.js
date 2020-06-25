const express = require('express')
const path = require('path');
const app = express()
const schedule = require('node-schedule');
const port = process.env.PORT || 3000


var Twitter = require('twitter');
var TWTR_CRED = require('./credentials.js');

var client = new Twitter({
  consumer_key: TWTR_CRED.consumer_key,
  consumer_secret: TWTR_CRED.consumer_secret,
  access_token_key: TWTR_CRED.access_token_key,
  access_token_secret: TWTR_CRED.access_token_secret
});


var query = "UnofficialResults from:bnltimes since:2020-6-23"
var ALL_TWEETS = []

var candidate_tally = {
	"Chakwera": [],
	"Kuwani":[],
	"Mutharika":[],
	"Null":[],
	"Other":[],
}


var Current_results = {
	"Chakwera": 0,
	"Kuwani":0,
	"Mutharika":0,
	"Null":0,
}



function paginateTweets(curr_max_id,query,client){
	console.log("running")
	if(curr_max_id == ""){
		client.get('search/tweets', {q: query,count:100,tweet_mode:"extended"}, function(error, tweets, response) {
		   console.log(tweets);
		   if(tweets.statuses.length > 0){
		   		ALL_TWEETS = ALL_TWEETS.concat(tweets.statuses)
		   		console.log("Checking if Tweets are matching")
		   		if(tweets.search_metadata.next_results !== null){
		   			next_id = tweets.search_metadata.next_results.split("&")[0].split("=")[1]
		   			paginateTweets(next_id,query,client)
		   		}
		   		else{
		   			console.log("terminating")
		   			processData(ALL_TWEETS)
		   		}
		   }else{
		   	processData(ALL_TWEETS)
		   }
		});	
	}
	else{
		client.get('search/tweets', {q: query,count:100,max_id:curr_max_id,tweet_mode:"extended"}, function(error, tweets, response) {
		   console.log(tweets);
		   if(tweets.statuses.length > 0){
		   		ALL_TWEETS = ALL_TWEETS.concat(tweets.statuses)
		   		if(tweets.search_metadata.next_results !== null){
		   			next_id = tweets.search_metadata.next_results.split("&")[0].split("=")[1]
		   			paginateTweets(next_id,query,client)
		   		}
		   		else{
		   			processData(ALL_TWEETS)
		   		}
		   }else{
		   	processData(ALL_TWEETS)
		   }
		});
	}
}

function processData(tweets){
	// var tweets = JSON.parse(data);
	candidates = Object.keys(candidate_tally)
	tweets.forEach(function(tweet){
		if(!tweet.full_text.includes("constitue")){
			lineInTweet = tweet.full_text.split("\n")
			lineInTweet.forEach(function(line){
				console.log(line)
				if(candidates.some(cand => line.toLowerCase().includes(cand.toLowerCase()))){
					candidates.map(function(cand){
						if(line.toLowerCase().includes(cand.toLowerCase())){
							candidate_tally[cand].push(line)
						}
					})
				}else if(line !== "" && line.split(" ").length > 1){
					// console.log(line)
					candidate_tally["Other"].push(line) 
				}
				
			})

		}


	})

	// console.log(candidate_tally)
	tallyResults(candidate_tally)
}

function tallyResults(candidate_tally){
	candidates = ["Chakwera","Kuwani","Mutharika","Null"]
	candidates.forEach(function(cand){
		centre_votes = candidate_tally[cand]
		var tally = 0
		centre_votes.forEach(function(centre){
			console.log(centre)
			// console.log(centre.split(/–|-/))
			if(["–","-"].some(myseparator => centre.includes(myseparator))){
				temp_count_str = centre.split(/–|-/)[1].replace(/\s+/g, '')	
			}
			else{
				temp_count_str = centre.split(/–|-|Chakwera |Kuwani |Mutharika |void /)[1].replace(/\s+/g, '')
			}
			// temp_count_str = centre.split(/–|-|Chakwera |Kuwani |Mutharika |void /)[1].replace(/\s+/g, '');
			
			centr_total = parseInt(temp_count_str.replace(",",""))
			if(centr_total<70000){
				tally += centr_total
			} 
			// tally += parseInt(temp_count_str.replace(",",""))
			console.log(tally)

		})

		Current_results[cand] = tally

	})

	console.log(Current_results)
}


paginateTweets("",query,client)

var updateJob = schedule.scheduleJob('*/5 * * * *', function(){
	var ALL_TWEETS = []

	var candidate_tally = {
		"Chakwera": [],
		"Kuwani":[],
		"Mutharika":[],
		"Null":[],
		"Other":[],
	}


	var Current_results = {
		"Chakwera": 0,
		"Kuwani":0,
		"Mutharika":0,
		"Null":0,
	}
  paginateTweets("",query,client)
});






app.use(express.static( path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index.html'))
app.get('/data', (req, res) => res.json(Current_results))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))