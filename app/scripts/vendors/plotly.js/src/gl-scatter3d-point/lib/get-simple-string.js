/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
'use strict';

module.exports = function(a){
  return (!a && a !== 0) ? '' : a.toString();
}
