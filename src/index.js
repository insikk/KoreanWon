/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * KoreanWon is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var KoreanWon = function () {
    AlexaSkill.call(this, APP_ID);
};



var num2kor = function (numString){
  var hangul = ['', 'il', 'E', 'saam', 'sa', 'oh', 'ryuk', 'chill', 'pal', 'gu'];
  var result = '';
  var hangulBigUnit = ['', 'mann', '<phoneme alphabet="ipa" ph="ʌ̹k">eok</phoneme>', 'jo', 'kyung'];
  // read lowest 4 digits.
  if (numString === '0'){
    return 'young';
  }

  var bigIndex = 0;
  while(numString.length != 0){
    var number;

    if (numString.length >= 4) {
      var four = numString.substr(numString.length - 4);
      number = parseInt(four);
    } else {
      number = parseInt(numString);
    }
    numString = numString.substr(0, numString.length - 4);

    var str = '';
    var hangulUnit = ['', 'sip', 'baek', 'cheon'];
    var numberUnit = [1, 10, 100, 1000];

    console.log(number);

    for (var i = 3; i >=0; i--){
      console.log(number / numberUnit[i]);
      var div = Math.floor(number / numberUnit[i]);
      console.log('div: ' + div);
      if(div != 0){
        if( i!=0 && div == 1){ // ex. 일백 이라고 쓰는 대신 백 이라고 쓴다.
          str = str + ' ' + hangulUnit[i];

        } else {
          str = str + ' '  + hangul[div] + ' ' + hangulUnit[i];
        }

      }
      number = number % numberUnit[i];
    }

    if(str.length !== 0){
      result = str + ' ' + hangulBigUnit[bigIndex] + '<break time="1ms"/> '  + result;
    }
    bigIndex += 1;
  }
  console.log(result);
  return result;
};

// Extend AlexaSkill
KoreanWon.prototype = Object.create(AlexaSkill.prototype);
KoreanWon.prototype.constructor = KoreanWon;

KoreanWon.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("KoreanWon onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

KoreanWon.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("KoreanWon onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "KoreanWon. You can say any number in US dollars. I'll convert it to Korean Won.";
    var repromptText = "You can say any number in US dollars";
    response.ask(speechOutput, repromptText);
};

KoreanWon.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("KoreanWon onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

var convertDollarToWon = function(dollar){
  var retval = {};
  retval.number = dollar + '000';
  retval.pronounciation = num2kor(dollar + '000') + ' won';
  return retval;
};

KoreanWon.prototype.intentHandlers = {
  // register custom intent handlers
  "KoreanWonIntent": function (intent, session, response) {
    var dollarAmount = intent.slots.DollarAmount.value;
    console.log("DollarAmount: " + dollarAmount);
    var dollarBigUnit = intent.slots.DollarBigUnit.value;
    console.log("dollarBigUnit: " + dollarBigUnit);

    if(dollarBigUnit === 'M' || dollarBigUnit === 'million'){
      dollarAmount = dollarAmount + '000000';
    } else if(dollarBigUnit ==='B' || dollarBigUnit === 'billion'){
      dollarAmount = dollarAmount + '000000000';
    } else if(dollarBigUnit === 'T' || dollarBigUnit == 'trillion'){
      dollarAmount = dollarAmount + '000000000000';
    }

    var answer = convertDollarToWon(dollarAmount);
    var outputSpeech = {};
    outputSpeech.type = 'SSML';
    outputSpeech.speech = '<speak>' + answer.pronounciation + '</speak>';
    response.tellWithCard(outputSpeech, "KoreanWon", "KRW " + answer.number);
  },
  "AMAZON.HelpIntent": function (intent, session, response) {
    response.ask("You can say hello to me!", "You can say hello to me!");
  }
};



// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the KoreanWon skill.
    var koreanWon = new KoreanWon();
    koreanWon.execute(event, context);
};
