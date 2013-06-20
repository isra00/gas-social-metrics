var Config = {
  facebookGraphId: "your FB user or fanpage ID",
  twitterUser: "your twitter user, for example ivianag",
  twitterApiConsumerKey: "your twitter api consumer key",
  twitterApiConsumerSecret: "your twitter api consumer secret",
  analyticsAccount: "your Google Analytics account ID",
  analyticsProperty: "your Google Analytics property ID",
  spreadsheetId: "the google spreadsheet in which you want to insert data"
};

function getFacebookLikes_(sIdSocialGraph)
{
  var oSocialGraphData = Utilities.jsonParse(UrlFetchApp.fetch("https://graph.facebook.com/" + sIdSocialGraph));
  return oSocialGraphData["likes"];
}

function getTwitterFollowers_(twitterUser)
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
  
  var url = "https://api.twitter.com/1.1/users/show.json?screen_name=" + twitterUser;
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return {
    followers: json["followers_count"],
    following: json["friends_count"]
  };
}

function getLastNdays_(nDaysAgo) {
  var today = new Date(), 
      before = new Date();
  before.setDate(today.getDate() - nDaysAgo);
  return Utilities.formatDate(before, 'GMT', 'yyyy-MM-dd');
}

function getAnalyticsForDay_() {

  var profileId = Analytics.Management.Profiles.list(Config.analyticsAccount, Config.analyticsProperty).getItems()[0].getId(),
      tableId = 'ga:' + profileId,
      startDate = getLastNdays_(1),
      endDate = getLastNdays_(1),
      results = Analytics.Data.Ga.get(tableId, startDate, endDate, 'ga:visits,ga:pageviews'),
      output = {
        "visits": "?",
        "pageviews": "?"
      };

  if (results.getRows())
  {
    output = {
      "visits": results.getRows()[0][0],
      "pageviews": results.getRows()[0][1]
    }
  }

  return output;
}

function insertSocialMetrics()
{
  var oSpreadsheet = SpreadsheetApp.openById(Config.spreadsheetId),
      oPage = oSpreadsheet.getSheets()[0],
      oYesterday,
      nFbLikes = getFacebookLikes_(Config.facebookGraphId),
      oTwitter = getTwitterFollowers_(Config.twitterUser),
      oAnalytics = getAnalyticsForDay_();
  
  oYesterday = new Date();
  oYesterday.setDate(oYesterday.getDate() - 1);
  
  oPage.appendRow([ oYesterday, nFbLikes, oTwitter["followers"], oTwitter["following"], oAnalytics["visits"], oAnalytics["pageviews"] ]);
}
