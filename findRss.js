function findRss() {
    var links = Array.prototype.filter.call(document.head.childNodes, function (node) {
        return (node.nodeType === 1 &&
                node.nodeName.toUpperCase() === "LINK" &&
                /rss|atom/.test(node.getAttribute('type')));
    });
    // rss found, update the icon
    return links.map(function (l) {
        return l.href;
    });
//chrome.browserAction.setIcon({path: "icons/default.png"});
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    sendResponse({'result': findRss()});
});
