var trigger_change_event = function(elem) {
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        elem.dispatchEvent(evt);
    } else {
        elem.fireEvent("onchange");
    }

}