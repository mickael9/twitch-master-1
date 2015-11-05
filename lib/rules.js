var util = require('util');
var fs = require('fs');
var re = /^((?:[a-z_]+-)*)(.*)$/;
var rules = require('../rules.json');

var exports = module.exports = {};

module.exports.reload = function() {
    fs.exists('../rules.json', function() {
        try {
            rules = require('../rules.json');
            console.log('(Re)loaded rules.json');
        } catch (ex) {
            console.log('Could not load rules.json');
            console.log(ex);
        }
    });
}

module.exports.resolve = function(search) {
    var match = re.exec(search);
    var key = match[2];
    var result = null;
    var resolved_rule = null;
    var modifiers = match[1].split('-').filter(Boolean);

    // some() is used to stop iteration as soon as we found a matching rule
    rules.some(function(rule) {
        var test_key = key; // key on which rules are to be matched against
        var value = null;   // match result

        if (rule.modifiers != null) {
            // check that all specified modifiers are allowed
            // and are in the right place
            // otherwise, abort this rule
            var rule_modifier_min_index = 0;
            if (modifiers.some(function(mod) {
                var rule_modifier_index = rule.modifiers.indexOf(mod);
                if (rule_modifier_index >= rule_modifier_min_index) {
                    rule_modifier_min_index = rule_modifier_index + 1;
                    return false;
                }
                return true;
            }))
            {
                return false; // continue some() loop
            }
        } else {
            // If no modifiers are allowed, use the full search as key, instead of the one
            // without modifiers (ctrl-c rather than c)
            // This is to allow rules such as "ctrl-c" when modifiers is not set.
            test_key = search;
        }

        if (rule.type == "simple") {
            if (rule.list && rule.list.indexOf(test_key) != -1) {
                value = test_key;
            } else if (rule.map && rule.map[test_key] != null) {
                value = rule.map[test_key];
            }
        } else if (rule.type == "regex") {
            // Try matching against the rule.list regexes first
            // The resulting value is the key itself
            if (rule.list != null) {
                rule.list.some(function(regex) {
                    if (test_key.match("^" + regex + "$")) {
                        value = test_key;
                        return true;
                    } else {
                        return false;
                    }
                });
            }

            // If not successful, match against the rule.map regexes
            // The key is the regexp to match against the key
            // The value is the corresponding value in the map
            // with $0 replaced by the key
            if (value == null && rule.map != null) {
                Object.keys(rule.map).some(function(x) {
                    var m = test_key.match("^" + x + "$");
                    if (m == null) {
                        return false;
                    }
                    value = rule.map[x].replace("$0", test_key);
                    return true;
                });
            }
        }
        if (value == null) {
            // rule didn't match, continue to next one
            return false;
        } else {
            if (rule.modifiers != null) {
                // add the used modifiers in front of the value
                // only if modifiers are allowed
                value = modifiers.concat(value).join("-");
            }
            // build the final command from the rule.command and value
            // value is lowercased so that "X" will yield "shift-x", not "shift-X"
            // "VOTE" must be part of rule.command (not value) so that it isn't lowercased
            result = rule.command.replace("$0", value.toLowerCase());
            resolved_rule = rule;
            return true;
        }
    });

    return result;
}

