'use strict';
var subscriptions, lastResult, currentTab = {};

function initialize() {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    disable();

    chrome.storage.sync.get('subscriptions', function (result) {
        subscriptions = result.subscriptions.length ? result.subscriptions : [];
        fillInput();
        renderSubscriptions();
    });

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];

        currentTab.title = tab.title;
        currentTab.url = tab.url;
        chrome.tabs.executeScript(tab.id, {file: "findRss.js", allFrames: true}, function (result) {
            chrome.tabs.sendMessage(tab.id, {}, function (response) {
                if (response == null) {
                    document.getElementById('words').value = 'error';
                    return;
                }
                if (response.result && response.result.length > 0) {
                    document.getElementById('add').disabled = false;
                    document.getElementById('add').addEventListener('click', addFeed);
                    document.getElementById('words').disabled = false;
                    document.getElementById('addSection').className = "Section New";

                    lastResult = response.result;
                    fillInput();
                }
            });

        });

    });
}

function renderSubscriptions() {
    var dom = document.getElementById('subscriptions');

    if (!subscriptions || !subscriptions.length) {
        dom.innerHTML = 'No subscriptions';
        return;
    }
    dom.innerHTML = '';
    subscriptions.forEach(function (s, i) {
        var div = document.createElement('div');
        div.className = 'Subscription';
        div.innerHTML = '<span>' + s.title + '</span>'
            + '<input type="button" value="-"/>';

        // open link
        div.addEventListener('click', function () {
            window.open(s.pageUrl);
        });

        // remove subscription
        div.lastChild.addEventListener('click', function (e) {
            subscriptions.splice(i, 1);
            chrome.storage.sync.set({'subscriptions': subscriptions});
            renderSubscriptions();
            e.stopPropagation();
        });

        dom.appendChild(div);
    });
}

function fillInput() {
    if (!subscriptions || !lastResult) {
        return;
    }

    subscriptions.forEach(function (s) {
        if (s.url === lastResult[0]) {
            document.getElementById('words').value = s.words;
        }
    })
}

function addFeed() {
    var url, index = -1,
        options = {
            type: 'basic',
            title: 'RSS Sniffer',
            message: '',
            iconUrl: 'icons/default.png'
        };
    if (document.getElementById('words').value == '') {
        opions.message = 'No keywords specified';
        chrome.notifications.create('rssinfo', options, function () {});
        return;
    }

    url = lastResult[0];
    subscriptions.forEach(function (s, i) {
        if (s.url == url) {
            index = i;
        }
    })

    if (index === -1) {
        subscriptions.push({
            title: currentTab.title,
            pageUrl: currentTab.url,
            url: url,
            words: document.getElementById('words').value
        });
    } else {
        subscriptions[index].words = document.getElementById('words').value;
    }

    chrome.storage.sync.set({'subscriptions': subscriptions}, function () {
        options.message = index > -1 ? 'Modified subscription' : 'Added new subscription';
        chrome.notifications.create('rssinfo', options, function () {});
        if (index === -1) {
            renderSubscriptions();
        }
    });
}

function disable() {
    document.getElementById('add').disabled = true;
    document.getElementById('words').disabled = true;
    document.getElementById('addSection').className += "Disabled";
}

document.addEventListener('DOMContentLoaded', initialize);
