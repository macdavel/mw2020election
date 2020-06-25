const fs = require('fs');
fs.readFile('tweets.json',processData);

var candidate_tally = {
	"Chakwera": [],
	"Kuwani":[],
	"Mutharika":[],
	"Null":[],
	"Other":[],
}


function processData(err,data){
	var tweets = JSON.parse(data);
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

	console.log(candidate_tally)
	tallyResults(candidate_tally)
}

function tallyResults(candidate_tally){
	Current_results = {
		"Chakwera": 0,
		"Kuwani":0,
		"Mutharika":0,
		"Null":0,
	}

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