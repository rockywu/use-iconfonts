"use strict";
/**
 * Created by rocky on 16/6/27.
 */

function hex2Int(hexStr) {
    var val = parseInt(hexStr, 16);
    return isNaN(val) ? false : val;
}

function int2Hex(intStr) {
    if (typeof intStr != "number") {
        return false;
    }
    try {
        return intStr.toString(16);
    } catch (e) {
        return false;
    }
}

exports = module.exports = {
    hex2Int: hex2Int,
    int2Hex: int2Hex
};