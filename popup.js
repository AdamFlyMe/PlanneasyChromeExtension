let alert = document.getElementById('alert');
let cards = document.getElementById('cards');
let navOptions = document.getElementById('navOptions');
let newNoteButton = document.getElementById('newNoteButton');
let newNoteTitle = document.getElementById('newNoteTitle');
let newNoteCategory = document.getElementById('newNoteCategory');
let newNoteDescription = document.getElementById('newNoteDescription');
let newNoteColor = document.getElementById('newNoteColor');
let editNoteButton = document.getElementById('editNoteButton');
let editNoteEntryId = document.getElementById('editNoteEntryId');
let editNoteTitle = document.getElementById('editNoteTitle');
let editNoteCategory = document.getElementById('editNoteCategory');
let editNoteDescription = document.getElementById('editNoteDescription');
let editNoteColor = document.getElementById('editNoteColor');
let removeNoteButton = document.getElementById('removeNoteButton');
let removeNoteEntryId = document.getElementById('removeNoteEntryId');
let removeNotesButton = document.getElementById('removeNotesButton');
let deleteButton = document.getElementById('deleteNote');

function addNote(){
    if (newNoteTitle.value != "" && newNoteDescription.value != "") {
        chrome.storage.local.get(null, function(items) {
            let keys = Object.keys(items);
            let entryNum = 0;
            let entryIdFound = false;
            while (!entryIdFound){
                if(!keys.includes("entry" + entryNum)){
                    entryIdFound = true;
                }
                else{
                    entryNum++;
                }
            }
            let entryName = 'entry' + entryNum;
            chrome.storage.local.set({[entryName] : {'title' : newNoteTitle.value, 'category' : newNoteCategory.value, 'description' : newNoteDescription.value, 'color' : newNoteColor.value}}, function (result) {
                newNoteTitle.value = "";
                newNoteCategory.value = "";
                newNoteDescription.value = "";
                updateStorage();
            });
        });
    }
    else{
        alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
            "  <strong>Failure!</strong> Please make sure to fill in all required fields.\n" +
            "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "    <span aria-hidden=\"true\">&times;</span>\n" +
            "  </button>\n" +
            "</div>\n";
    }
}

function modifyNote(){
    if (editNoteTitle.value != "" && editNoteDescription.value != "") {
        chrome.storage.local.get(null, function(items) {
            let index = Object.keys(items).length;
            let entryName = editNoteEntryId.innerHTML;
            chrome.storage.local.set({[entryName] : {'title' : editNoteTitle.value, 'category' : editNoteCategory.value, 'description' : editNoteDescription.value, 'color' : editNoteColor.value}}, function (result) {
                updateStorage();
            });
        });
    }
    else{
        alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
            "  <strong>Failure!</strong> Please make sure to fill in all required fields.\n" +
            "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "    <span aria-hidden=\"true\">&times;</span>\n" +
            "  </button>\n" +
            "</div>\n";
    }
}

function deleteNote(){
    let entryId = removeNoteEntryId.innerHTML;
    console.log(entryId);
    chrome.storage.local.remove(entryId, function() {
        let error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    updateStorage();
}

function deleteNotes(){
    chrome.storage.local.clear(function() {
        let error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    updateStorage();
}

function updateStorage(){
    chrome.storage.local.get(null, function (items) {
        var user = firebase.auth().currentUser;
        if (user) {
            firebase.database().ref('users/' + user.uid).set(items, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    location.reload();
                }
            });
        }
        else{
            alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
                "  <strong>Login expired!</strong> Please log in again." +
                "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
                "    <span aria-hidden=\"true\">&times;</span>\n" +
                "  </button>\n" +
                "</div>\n";
            handleLogin();
        }
    });
}

function loadNotes() {
    cards.innerHTML = "<style>.card-img-top{width: 100px; height: 100px; object-fit: cover;}</style><div class=\"card mx-auto\" style=\"width: 18rem;\"><img class=\"card-img-top mx-auto\" src=\"icons/loading.gif\" alt=\"Loading\"><div class=\"card-body\"><h5 class=\"card-title text-center\">Loading your entries...</h5><p class='text-center'>Taking too long? Check your internet connection or try reopening the extension.</p></div></div>";
    var user = firebase.auth().currentUser;
    if (user) {
        firebase.database().ref('/users/' + user.uid).once('value').then(function(items) {
            items = items.val();
            console.log(items);
            cards.innerHTML = "";
            for (let key in items) {
                chrome.storage.local.set({[key]: items[key]});
                let title = "";
                let category = "";
                let description = "";
                if (items[key].hasOwnProperty('title')) {
                    title = items[key].title;
                }
                if (items[key].hasOwnProperty('category')) {
                    category = items[key].category;
                }
                if (items[key].hasOwnProperty('description')) {
                    description = items[key].description;
                }
                let cardClass = "card mx-auto";
                if (items[key].hasOwnProperty('color')) {
                    switch(items[key].color) {
                        case "white":
                            break;
                        case "black":
                            cardClass += " text-white bg-dark";
                            break;
                        case "indigo":
                            cardClass += " text-white bg-primary";
                            break;
                        case "gray":
                            cardClass += " text-white bg-secondary";
                            break;
                        case "green":
                            cardClass += " text-white bg-success";
                            break;
                        case "red":
                            cardClass += " text-white bg-danger";
                            break;
                        case "orange":
                            cardClass += " text-white bg-warning";
                            break;
                        case "blue":
                            cardClass += " text-white bg-info";
                            break;
                    }
                }
                if (items[key].hasOwnProperty('title') && items[key].hasOwnProperty('description')) {
                    cards.innerHTML += "<div class=\"" + cardClass +"\" style=\"width: 18rem;\">\n" +
                        "<div class=\"card-header\" style='text-align: right; padding-left: .5rem; padding-right: .5rem; padding-top: .25rem; padding-bottom: .25rem'>" +
                        "<i class=\"material-icons\" style='font-size: 18px' title=\"Delete\" data-entryid=\"" + key +"\" data-toggle=\"modal\" data-target=\"#removeNote\">\n" +
                        "delete\n" +
                        "</i>&nbsp;&nbsp;<i class=\"material-icons\" style='font-size: 18px' title=\"Edit\" data-entryid=\"" + key +"\" data-toggle=\"modal\" data-target=\"#editNote\">\n" +
                        "edit\n" +
                        "</i></div>\n" +
                        "<div class=\"card-body\">\n" +
                        "<h5 class=\"card-title\">" + title + "</h5>\n" +
                        "<h6 class=\"card-subtitle mb-2\">" + category + "</h6>\n" +
                        "<p class=\"card-text\">" + description + "</p>\n" +
                        "</div>\n" +
                        "</div><br>";
                }
            }
        });
    }
    else{
        alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
            "  <strong>Login expired!</strong> Please log in again." +
            "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "    <span aria-hidden=\"true\">&times;</span>\n" +
            "  </button>\n" +
            "</div>\n";
        handleLogin();
    }
}

function handleLogin(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user);
            loadNotes();
            navOptions.style.visibility = "visible";
            newNoteButton.onclick = addNote;
            editNoteButton.onclick = modifyNote;
            removeNoteButton.onclick = deleteNote;
            removeNotesButton.onclick = deleteNotes;
        } else {
            navOptions.style.visibility = "hidden";
            cards.innerHTML = "<div class='text-center'>" +
                "<div class=\"card mx-auto\" style=\"width: 18rem;\">\n" +
                "  <div class=\"card-body\">\n" +
                "    <h5 class=\"card-title\">Log in</h5>\n" +
                "    <p class=\"card-text\">Please sign in with Google to use the extension.</p>\n" +
                "    <button id=\"loginButton\" type=\"button\" class=\"btn btn-outline-primary\">Login</button>\n" +
                "  </div>\n";
            document.getElementById("loginButton").onclick = function() {
                firebase.auth().signInWithPopup(provider).then(function (result) {
                    var token = result.credential.accessToken;
                    var user = result.user;
                    console.log(user);
                    loadNotes();
                    navOptions.style.visibility = "visible";
                    newNoteButton.onclick = addNote;
                    editNoteButton.onclick = modifyNote;
                    removeNoteButton.onclick = deleteNote;
                    removeNotesButton.onclick = deleteNotes;
                    alert.innerHTML = "<div class=\"alert alert-success alert-dismissible fade show\" role=\"alert\">\n" +
                        "  <strong>Success!</strong> Logged in successfully." +
                        "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
                        "    <span aria-hidden=\"true\">&times;</span>\n" +
                        "  </button>\n" +
                        "</div>\n";
                }).catch(function (error) {
                    console.log(error);
                    alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
                        "  <strong>Failure!</strong> Please try again." +
                        "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
                        "    <span aria-hidden=\"true\">&times;</span>\n" +
                        "  </button>\n" +
                        "</div>\n";
                });
            }
        }
    });
}

$( document ).ready(function() {
    document.querySelectorAll(".deleteEntryButton").forEach(function (element) {
        console.log(element);
        element.addEventListener('click', function (event) {
            let element = event.target;
            console.log(element);
            let id = element.dataset.entryid;
            console.log(id);
            deleteNote(id);
        });
    });
    $('#editNote').on('show.bs.modal', function (event) {
        let id = $(event.relatedTarget)[0].dataset.entryid;
        chrome.storage.local.get(null, function (items) {
            entry = items[id];
            if(entry.hasOwnProperty('title')) {
                editNoteEntryId.innerHTML = id;
                editNoteTitle.value = entry.title;
                if(entry.hasOwnProperty('category'))
                    editNoteCategory.value = entry.category;
                if(entry.hasOwnProperty('description'))
                    editNoteDescription.value = entry.description;
                if(entry.hasOwnProperty('color'))
                    editNoteColor.value = entry.color;
            }
            else{
                $('#editNote').modal("hide");
                alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
                    "  <strong>Failure!</strong> Please try again later.\n" +
                    "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
                    "    <span aria-hidden=\"true\">&times;</span>\n" +
                    "  </button>\n" +
                    "</div>\n";
            }
        });
    });
    $('#removeNote').on('show.bs.modal', function (event) {
        let id = $(event.relatedTarget)[0].dataset.entryid;
        chrome.storage.local.get(null, function (items) {
            entry = items[id];
            if(entry.hasOwnProperty('title')){
                removeNoteEntryId.innerHTML = id;
            }
            else{
                $('#removeNote').modal("hide");
                alert.innerHTML = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n" +
                    "  <strong>Failure!</strong> Please try again later.\n" +
                    "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
                    "    <span aria-hidden=\"true\">&times;</span>\n" +
                    "  </button>\n" +
                    "</div>\n";
            }
        });
    });
});

var config = {
    apiKey: "AIzaSyAXZkRRZumlXkulXds9JeSik67zRbiZDd0",
    authDomain: "planneasy.firebaseapp.com",
    databaseURL: "https://planneasy.firebaseio.com",
    projectId: "planneasy",
    storageBucket: "planneasy.appspot.com",
    messagingSenderId: "371635549768"
};
firebase.initializeApp(config);
handleLogin();