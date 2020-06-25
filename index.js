var Twitter = require('twitter');
var TWTR_CRED = require('./credentials.js');
const fs = require('fs');

var client = new Twitter({
  consumer_key: TWTR_CRED.consumer_key,
  consumer_secret: TWTR_CRED.consumer_secret,
  access_token_key: TWTR_CRED.access_token_key,
  access_token_secret: TWTR_CRED.access_token_secret
});



var query = "UnofficialResults from:bnltimes since:2020-6-23"

var ALL_TWEETS = []

// client.get('search/tweets', {q: query,count:100}, function(error, tweets, response) {
//    console.log(tweets);
//    if(tweets.length > 0){
//    		ALL_TWEETS = ALL_TWEETS.concat(tweets.statuses)
//    		if(tweets.search_metadata !== null){
//    		}
//    }
// });


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
		   			saveTweets(ALL_TWEETS)
		   		}
		   }else{
		   	saveTweets(ALL_TWEETS)
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
		   			saveTweets(ALL_TWEETS)
		   		}
		   }else{
		   	saveTweets(ALL_TWEETS)
		   }
		});
	}
}


function saveTweets(ALL_TWEETS){
	fileContent = JSON.stringify(ALL_TWEETS)
	fs.writeFile("tweets.json", fileContent, 'utf8', function (err) {
	    if (err) {
	        console.log("An error occured while writing JSON Object to File.");
	        return console.log(err);
	    }
	 
	    console.log("JSON file has been saved.");
	});
}


paginateTweets("",query,client)

