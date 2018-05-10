/**
 * Removes duplicate objects, where duplication is deteremined by toString() equality
 * @param diffs {Array.<GraphQLDiff>} - An array of GraphQLDiff
 * @returns {Array.<GraphQLDiff>} An array of GraphQLDiff objects that have had duplicate values removed
 */
exports.dedupe = function dedupe(diffs) {
    const seen = new Map();
    return diffs.filter(function(diff) {
        if (seen.has(diff.toString())) {
            return false;
        }
        seen.set(diff.toString(), true);
        return true;
    });
}

/**
 * Templates values into a string. Template placeholders are marked with a brackets and an ordinal, such as '{0}'.
 * @param str {String} - The template
 * @returns {String} - Interpolated string
 */
exports.format = function format(str) {
    let args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

