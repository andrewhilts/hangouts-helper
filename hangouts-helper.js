(function()
 {
    var authUser;
    var getSettings = function(callback){
        chrome.storage.sync.get("authUser", function(items) {
            if(items.authUser){
                authUser = items.authUser;
                callback();
            }
            else{
                var newAuthUser = prompt("Please input the full name, as it appears in Gmail, of the authorized user of the webcam (eg: your personal account).");
                chrome.storage.sync.set({
                    authUser: newAuthUser
                }, function() {
                    authUser = newAuthUser;
                    callback();
                });
            }
        });
    }

    var hangoutsCheckers = function(){
        var joinAttempts = 0;
        var maxJoinAttempts = 20;
        var simulate = function(target, evtName)
        {
            evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(evtName, true, true,document.defaultView, 0, 0, 0, 0, 0, false, false,false, false, 0, target);
            target.dispatchEvent(evt);
        }

        var simulateClick = function(target)
        {
            simulate(target, "mouseover");
            simulate(target, "mousedown");
            simulate(target, "mouseup");
            simulate(target, "mouseout");
        }
        var cameraEl;
        var getCameraEl = function(){
          $("div[role='button']").each(
          function(){
          var aria = $(this).attr('aria-label');
          if(typeof aria !== "undefined"){
            if(aria.indexOf("Turn camera") > -1){
              cameraEl = $(this);
            }
          }
          });
        }
        var checkForPrompt = function()
        {
            var clicked = false;
            $('div[role="button"]').each(function(idx, item) // For each div with attribute role = "button"
                                         {
                if ($(item).html().indexOf("Yes") >= 0) // Correct button found
                {
                    simulateClick(item);
                    clicked = true;
                    console.log('Clicked on "Still there?" prompt. Checking again after interval.');
                }
            });
            if(!clicked){
                console.log('No "Still there?" prompt found. Checking again after interval.');
            }
            setTimeout(checkForPrompt, 6000); // Repeat every 6 seconds
        }

        var joinCall = function(){
            var clicked = false;
            var buttons = $('div[role="button"]');
            if(buttons.length > 0){
                buttons.each(function(idx, item) // For each div with attribute role = "button"
                             {
                    if ($(item).html().indexOf("Join") >= 0) // Correct button found
                    {
                        console.log("Joining Call.");
                        simulateClick(item);
                        clicked = true;
                        checkForPrompt();
                        manageWebCam();
                    }
                });
                if(!clicked){
                    console.log("No join button found. Attempt # "+ joinAttempts + ". Trying again after interval.");
                    joinAttempts++;
                    if(joinAttempts > maxJoinAttempts){
                      checkForPrompt();
                      manageWebCam();
                    }
                    else{
                      setTimeout(joinCall, 1000);
                    }
                }
            }
            else{
                console.log("No buttons available. Trying again after interval.");
                setTimeout(joinCall, 1000);
            }
        }

        var manageWebCam = function(){
             var statusEl = $("div[role='status']"); 
             getCameraEl();
             var cameraOn = true;
             var authUserString = "Open menu for " + authUser;
             var authUserAway = true;
             
             $("div[role='menuitem']").each(
                 function(){
                     var aria = $(this).attr('aria-label');
                     if(typeof aria !== "undefined"){
                         if(aria.indexOf(authUser) > -1){
                             authUserAway = false;
                         }
                     }
                 });
             
             if(authUserAway){
                 if(cameraEl.attr('aria-label').indexOf("Turn camera off") > -1){
                     console.log("No Auth User present. Turning off camera");
                     updateIcon("off");
                     simulateClick(cameraEl.get(0));
                 }
             }
             else{
                 if(cameraEl.attr('aria-label').indexOf("Turn camera on") > -1){
                     console.log("Auth User present. Turning on camera");
                     updateIcon("on");
                     simulateClick(cameraEl.get(0));
                 }
             }
             setTimeout(manageWebCam, 6000);
         }

        joinCall();
        setTimeout(window.reload, 360000);
    }

    function updateIcon(status){
        var filePath
        if(status == "on"){
            filePath = "icon-active.png";
        }
        else{
            filePath = "icon.png";
        }
        msg = {
            task: "updateIcon",
            filePath: filePath
        }
        sendMessage(msg);
    }

    function sendMessage(msg){
        chrome.runtime.sendMessage(msg, function() {
          console.log("Message processed successfully.");
        });
    }

    function init()
    {
        updateIcon("off");
        $(document).ready(function(){
            getSettings(hangoutsCheckers);
        });
    }
    init();
})();