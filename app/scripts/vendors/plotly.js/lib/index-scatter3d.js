/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Plotly = require('../lib/core');

Plotly.register([
    require('../lib/scatter3d'),
    require('../lib/scatter3dpoint')
]);

module.exports = Plotly;
