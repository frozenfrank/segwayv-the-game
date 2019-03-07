var API_KEY, DOMAIN, SANDBOX = true, TESTMODE = true;
if(SANDBOX){
	//sandbox domain
	API_KEY = "8e67ea148709bf4af104229a6ad0aae9-c9270c97-a18ce204";
	DOMAIN = "sandbox50333a393b5f476d9fc454bbea91c4fc.mailgun.org";
} else {
	//real domain
	API_KEY = "8e67ea148709bf4af104229a6ad0aae9-c9270c97-a18ce204";
	DOMAIN = 'segwayv.com';
}

var fs = require("fs");
var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN, testMode: TESTMODE });
var emailList = require("./emailList.js");

//read the template and send it.. several times
fs.readFile("./email.html", 'utf8', (err, emailTemplate) => {
	if(err) throw Error(err);

	let counter=0;
	for(let emailInfo of emailList){
		let html = emailTemplate;
		for(let searchText in emailInfo.replacements){
			let replaceText = emailInfo.replacements[searchText];
			html = html.replace(searchText, replaceText);
		}

		mailgun.messages().send({
			from: "Ryan Hansen <hansryan@cloud.ifschools.org>",
			to: emailInfo.email,
			subject: `${emailInfo.firstGivenName}, you have a Senior Presentation!`,
			html: html,
		}, (error, body) => {
			error && console.warn(error);

			//log the body?? probably not...
			//TODO: keep track of how many have been sent
		});
	}
});