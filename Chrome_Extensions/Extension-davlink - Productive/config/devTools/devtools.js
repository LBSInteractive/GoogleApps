chrome.devtools.panels.create("(Old) DavLink-CBC",
    "app/site_media/logo/NetLink-48.png",
    "app/html/panelSniffer/panelSniffer_old.html",
    function (panel) {
        console.log('/**DavLink Iniciado**/');
    }
);

chrome.devtools.panels.create("(New Release) DavLink-CTR",
    "app/site_media/logo/NetLink-48.png",
    "app/html/panelSniffer/panelSniffer.html",
    function (panel) {
        console.log('/**DavLink Iniciado**/');
    }
);