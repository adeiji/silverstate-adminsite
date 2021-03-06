// Code goes here

(function() {
    'use strict'

    var app = angular.module('InspectionDetailsViewer', ['ui.tree']);

    var InspectionDetailsController = function($scope, ParseHandler) {

        var CRANE_TYPE = "craneType";
        var INSPECTION_POINT = "inspectionPoint";
        var OPTION = "option";

        ParseHandler.init();
        $scope.crane = {};
        var parseObjects = [];

        ParseHandler.getAllObjectsFromParse(ParseHandler.INSPECTION_POINT_OBJECT).then(function(inspectionPoints) {
            for (var i = 0; i < inspectionPoints.length; i++) {
                inspectionPoints[i].fetch();
            };

            $scope.inspectionPoints = inspectionPoints;
            $scope.inspectionPointsCopy = inspectionPoints;
            $scope.$apply();
        });

        ParseHandler.getAllObjectsFromParse(ParseHandler.OPTION_OBJECT).then(function(options) {
            for (var i = 0; i < options.length; i++) {
                options[i].fetch();
            };
            $scope.options = options;
            $scope.optionsCopy = options;
            $scope.$apply();
        });

        $scope.deleteObject = function(array, item, input) {
            var indexOfItem = array.indexOf(item);
            array.splice(indexOfItem, 1);
            input = "";
            item.destroy({
                success: function(item) {
                    // The item was deleted
                },
                error: function(item, error) {
                    alert('Error deleting the item from the server: ' + error.description)
                }
            });
        }

        $scope.addInspectionPoint = function(inspectionPointName) {
            if (!$scope.inspectionPoints) {
                $scope.inspectionPoints = [];
            }
            // Create Parse Object and save to server
            var inspectionPoint = ParseHandler.createInspectionPointParseObject(inspectionPointName);
            parseObjects.push(inspectionPoint);

            $scope.inspectionPoints.push(angular.copy(inspectionPoint));
            $scope.crane.newInspectionPoint = "";
        };

        $scope.addOption = function(optionName) {
            if (!$scope.options) {
                $scope.options = [];
            }

            // Create Parse Object and save to server
            var option = ParseHandler.createOptionParseObject(optionName);
            parseObjects.push(option);

            $scope.options.push(angular.copy(option));
            $scope.optionsCopy.push(angular.copy(option));
            $scope.crane.newOption = "";
        }

        $scope.itemSelected = function(selectedItem, input) {
            if (input == INSPECTION_POINT) {
                $scope.crane.newInspectionPoint = selectedItem.attributes.name;
                $scope.selectedInspectionPoint = selectedItem;
            } else {
                $scope.crane.newOption = selectedItem.attributes.name;
            }
        }

        var getUpdatedArray = function(array, item, newName) {

            var indexOfItem = array.indexOf(item);
            var foundItem = array[indexOfItem];
            var safeArray = angular.copy(array);

            safeArray.splice(indexOfItem, 1);
            foundItem.attributes.name = newName;
            safeArray.push(angular.copy(foundItem));

            return safeArray;
        }

        $scope.updateSelectedInspectionPoint = function() {
            var updatedArray = getUpdatedArray($scope.inspectionPoints, $scope.selectedInspectionPoint, $scope.crane.newInspectionPoint);
            $scope.inspectionPoints = [];

            for (var i = 0; i < updatedArray.length; i++) {
                $scope.inspectionPoints.push(updatedArray[i]);
            }

            $scope.selectedInspectionPoint.set("name", $scope.crane.newInspectionPoint);
            $scope.selectedInspectionPoint.save(null, {
                success: function(item) {

                },
                error: function(item, error) {
                    alert('Failed to save the object: ' + error.description)
                }

            });
        }

        var addSearchedItemToList = function (searchText, copyOfList) {
            if (searchText != '')
            {            
                var searchedList = [];
                for (var i = 0; i < copyOfList.length; i++) {
                    if (copyOfList[i].get("name").toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                        searchedList.push(copyOfList[i]);
                    }
                };

                return searchedList;
            }
            else {
                return copyOfList;
            }            
        }

        $scope.searchOptions = function (searchText) {
            $scope.options = addSearchedItemToList(searchText, $scope.optionsCopy);
        }

        $scope.searchInspectionPoints = function(searchText) {
            $scope.inspectionPoints = addSearchedItemToList(searchText, $scope.inspectionPointsCopy);
        }

        $scope.updateSelectedOption = function() {
            var updatedArray = getUpdatedArray($scope.options, $scope.selectedOption, $scope.crane.newOption);
            $scope.options = [];

            for (var i = 0; i < updatedArray.length; i++) {
                $scope.options.push(updatedArray[i]);
            }

            $scope.selectedOption.set("name", $scope.crane.newOption);
            $scope.selectedOption.save(null, {
                success: function(item) {

                },
                error: function(item, error) {
                    alert('Failed to save the object: ' + error.description)
                }

            });
        }
    };


    // Create the enter key press directive
    app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which == 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            })
        }
    });

    app.controller("InspectionDetailsController", ['$scope', 'ParseHandler', InspectionDetailsController]);

}());
