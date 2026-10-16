butiaV2.selectMap(ButiaSimMap.CircleArena)
butiaV2.onGraySensorSees(butia.v2.J5, ButiaColor.Black, 3, function () {

})
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 3, function () {

})
butiaV2.onDistance(butia.v2.J2, ButiaComparison.GreaterOrEqual, 40, 1, function () {

})
butiaV2.onDistance(butia.v2.J2, ButiaComparison.Less, 40, 2, function () {

})
