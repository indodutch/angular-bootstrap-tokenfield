(function () {
    'use strict';

    // Register module
    var myModule = angular.module('angularTokenfield', []);

    // Define directive
    myModule.directive ('myTokenfield', function() {
        return {
            restrict: 'A',
            scope: {
                'source': '=source',
                'tokens': '=tokens',
                'limit': '=limit',
                'minLength': '=minLength',
                'minWidth': '=minWidth',
                'showAutocompleteOnFocus': '=showAutocompleteOnFocus',
                'autocomplete': '=autocomplete',
                'createTokensOnBlur': '=createTokensOnBlur',
                'delimiter': '=delimiter',
                'beautify': '=beautify',
                'inputType': '=inputType'
            },
            link: function(scope, element, attrs) {
                element.tokenfield(scope);
            }
        }
    });
})();