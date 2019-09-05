/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var arraysToCalcdata = require('plotly.js/src/traces/scatter/arrays_to_calcdata');
var calcColorscales = require('plotly.js/src/traces/scatter/colorscale_calc');


/**
 * This is a kludge to put the array attributes into
 * calcdata the way Scatter.plot does, so that legends and
 * popovers know what to do with them.
 */
module.exports = function calc(gd, trace) {
    var cd = [{x: false, y: false, trace: trace, t: {}}];

    arraysToCalcdata(cd, trace);
    calcColorscales(trace);

    return cd;
};
