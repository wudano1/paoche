/* 用 GPS 座標判斷在哪一區。界線資料：內政部鄉鎮市區界線（經 taiwan-atlas 簡化）。 */
(function(root){
  "use strict";
  // 機場範圍：多元化計程車在這裡只能送客
  var AIRPORTS = [
    { n:"松山機場", lat:25.0694, lng:121.5525, r:900 },
    { n:"桃園機場", lat:25.0777, lng:121.2328, r:2800 }
  ];
  function dist(lat1, lng1, lat2, lng2){
    var R = 6371000, toR = Math.PI/180;
    var dLat = (lat2-lat1)*toR, dLng = (lng2-lng1)*toR;
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*toR)*Math.cos(lat2*toR)*Math.sin(dLng/2)*Math.sin(dLng/2);
    return 2*R*Math.asin(Math.sqrt(a));
  }
  function inRing(x, y, r){
    var inside = false;
    for (var i = 0, j = r.length - 2; i < r.length; j = i, i += 2){
      var xi = r[i], yi = r[i+1], xj = r[j], yj = r[j+1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function inPoly(x, y, poly){
    if (!inRing(x, y, poly[0])) return false;
    for (var k = 1; k < poly.length; k++) if (inRing(x, y, poly[k])) return false;
    return true;
  }
  function locate(areas, lat, lng){
    for (var a = 0; a < AIRPORTS.length; a++){
      var ap = AIRPORTS[a];
      if (dist(lat, lng, ap.lat, ap.lng) <= ap.r) return { area:ap.n, county:"", airport:true, inZone:true };
    }
    for (var i = 0; i < areas.length; i++){
      var ar = areas[i], b = ar.b;
      if (lng < b[0] || lng > b[2] || lat < b[1] || lat > b[3]) continue;
      for (var p = 0; p < ar.p.length; p++) if (inPoly(lng, lat, ar.p[p])) return { area:ar.n, county:ar.c, airport:false, inZone:true };
    }
    return { area:"營業區外", county:"", airport:false, inZone:false };
  }
  var api = { locate:locate, AIRPORTS:AIRPORTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PaoGeo = api;
})(this);
