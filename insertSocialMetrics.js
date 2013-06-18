var Config = {
  facebookGraphId: "your FB user or fanpage ID",
  twitterUser: "your twitter user, for example ivianag",
  twitterApiConsumerKey: "your twitter api consumer key",
  twitterApiConsumerSecret: "your twitter api consumer secret"
};

function getFacebookLikes_(sIdSocialGraph)
{
  var oSocialGraphData = Utilities.jsonParse(UrlFetchApp.fetch("https://graph.facebook.com/" + sIdSocialGraph));
  return oSocialGraphData["likes"];
}

function getTwitterFollowers_(usuario)
{  
  var oauthConfig = UrlFetchApp.addOAuthService("twitter");
  oauthConfig.setAccessTokenUrl("http://api.twitter.com/oauth/access_token");
  oauthConfig.setRequestTokenUrl("http://api.twitter.com/oauth/request_token");
  oauthConfig.setAuthorizationUrl("http://api.twitter.com/oauth/authorize");
  oauthConfig.setConsumerKey(Config.twitterApiConsumerKey);
  oauthConfig.setConsumerSecret(Config.twitterApiConsumerSecret);
  
  var options = {
    "oAuthServiceName" : "twitter",
    "oAuthUseToken" : "always"
  };
  
  var url = "https://api.twitter.com/1.1/users/show.json?screen_name=JMJ_Rio2013";
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json["followers_count"];
}

function insertSocialMetrics()
{
  var oSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      oPage = oSpreadsheet.getSheets()[0],
      nFbLikes = getFacebookLikes_(Config.facebookGraphId),
      nTwitterFollowers = getTwitterFollowers_(Config.twitterUser);
  
  oPage.appendRow([new Date(), nFbLikes, nTwitterFollowers]);
}
