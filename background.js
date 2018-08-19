var config = {
    apiKey: "AIzaSyAXZkRRZumlXkulXds9JeSik67zRbiZDd0",
    authDomain: "planneasy.firebaseapp.com",
    databaseURL: "https://planneasy.firebaseio.com",
    projectId: "planneasy",
    storageBucket: "planneasy.appspot.com",
    messagingSenderId: "371635549768"
};
firebase.initializeApp(config);
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    if(request.greeting === "handleLogin") {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            var token = result.credential.accessToken;
            var user = result.user;
            console.log(user);
            chrome.runtime.sendMessage({greeting: "loginHandled"},
                function (response) {
                });
            chrome.tabs.create({"url": chrome.extension.getURL("success.html")}, function(tab) {
                console.log(tab);
            });
        }).catch(function (error) {
            console.log(error);
        });
    }
});