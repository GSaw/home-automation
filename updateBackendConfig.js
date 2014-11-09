// This script transforms old formats to new

(function () {
  var config = loadObject("config.json");

  function getNewID(id) {
    var pattern1 = /^ZWayVDev_([0-9]+(:[0-9])+)$/,
      pattern2 = /^Remote_[0-9]+_([0-9]+(:[0-9])+)$/;
    
    if (id.match(pattern1)) {
      return id.replace(pattern1, "ZWayVDev_zway_$1").replace(/:/g, "-");
    } else if (id.match(pattern2)) {
      return id.replace(pattern2, "ZWayVDev_zway_Remote_$1").replace(/:/g, "-");
    } else {
      return id;
    }
  }

  if (config) {
    // Update IDs of devices created by SwitchControlGenerator and ZWaveGate
    Object.keys(config.vdevInfo).forEach(function(id) {
      var _id = getNewID(id);
      if (id !== _id) {
        console.log("Changing VDev ID from " + id + " to " + _id);
        config.vdevInfo[_id] = config.vdevInfo[id];
        delete config.vdevInfo[id];
      }
    });

    // Update IDs in modules params
    function fixArray(arr) {
      arr.forEach(function(element, index) {
        if (typeof element === "string") {
          if (element != getNewID(element)) {
            console.log("Changing ID in params (array) from " + element + " to " + getNewID(element));
            arr[index] = getNewID(element);
          }
        } else if (element.constructor === Array) {
          fixArray(element);
        } else if (typeof element === "object") {
          fixObject(element);
        }
      });
    }
    
    function fixObject(obj) {
      for (var key in obj) {
        if (typeof obj[key] === "string") {
          if (obj[key] != getNewID(obj[key])) {
            console.log("Changing ID in params (object) from " + obj[key] + " to " + getNewID(obj[key]));
            obj[key] = getNewID(obj[key]);
          }
        } else if (obj[key].constructor === Array) {
          fixArray(obj[key]);
        } else if (typeof obj[key] === "object") {
          fixObject(obj[key]);
        }
      }
    }
    
    for (var indx in config.instances) {
      fixObject(config.instances[indx].params);
    }
    
    saveObject("config.json", config);
  }
})();