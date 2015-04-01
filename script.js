// Code goes here

(function() {
    'use strict'

    var app = angular.module('InspectionDetailsViewer', ['ui.tree']);

    var InspectionDetailsController = function($scope, ParseHandler) {

        var CRANE_TYPE = "craneType";
        var INSPECTION_POINT = "inspectionPoint";
        var OPTION = "option";

        ParseHandler.init();

        $scope.inspectionDetails = {};

        var getAllCranes = function() {
            ParseHandler.getAllObjectsFromParse(ParseHandler.CRANE_OBJECT).then(function(cranes) {
                $scope.craneTypes = cranes;
            });
        }

        ParseHandler.getAllObjectsFromParse(ParseHandler.LIST_OBJECT).then(function(lists) {
            $scope.savedLists = lists;
        })

        getAllCranes();

        var parseObjects = [];
        $scope.crane = {

        };

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

        $scope.addItemToInspectionList = function(selectedCrane) {
            if (!$scope.inspectionDetails.crane) {
                $scope.inspectionDetails.crane = {};
            }

            $scope.inspectionDetails.crane.name = selectedCrane.attributes.name;
        }

        $scope.addCraneType = function(craneName) {
            if (!$scope.craneTypes) {
                $scope.craneTypes = [];
            }
            // Create Parse Object and save to server
            var crane = ParseHandler.createCraneParseObject(craneName);
            parseObjects.push(crane);

            $scope.craneTypes.push(angular.copy(crane));
            $scope.crane.newCraneType = ""
        };

        $scope.itemSelected = function(selectedItem, input) {
            if (input == CRANE_TYPE) {
                $scope.crane.newCraneType = selectedItem.attributes.name;
            } else if (input == INSPECTION_POINT) {
                $scope.crane.newInspectionPoint = selectedItem.attributes.name;
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

        $scope.updateSelectedCraneType = function() {
            var updatedArray = getUpdatedArray($scope.craneTypes, $scope.selectedCrane, $scope.crane.newCraneType);
            $scope.craneTypes = [];

            for (var i = 0; i < updatedArray.length; i++) {
                $scope.craneTypes.push(updatedArray[i]);
            }

            $scope.selectedCrane.set("name", $scope.crane.newCraneType);
            $scope.selectedCrane.save(null, {
                success: function(item) {

                },
                error: function(item, error) {
                    alert('Failed to save the object: ' + error.description)
                }
            });
        }

        $scope.addList = function(selectedList) {
            var listOfItems = selectedList.attributes.listOfItems;
            for (var i = 0; i < listOfItems.length; i++) {
                listOfItems[i].fetch();
            };

            for (var i = 0; i < listOfItems.length; i++) {
                if (selectedList.attributes.type === INSPECTION_POINT) {
                    if (!$scope.inspectionDetails.crane.inspectionPoints) {
                        $scope.inspectionDetails.crane.inspectionPoints = [];
                    }

                    $scope.inspectionDetails.crane.inspectionPoints.push(listOfItems[i]);
                } else if (selectedList.attributes.type === OPTION) {
                    if (!$scope.selectedInspectionPoint) {
                        $scope.error = "No Inspection Point Selected";
                    } else if ($scope.selectedInspectionPoint) {
                        for (var j = 0; j < $scope.inspectionDetails.crane.inspectionPoints.length; j++) {
                            if ($scope.inspectionDetails.crane.inspectionPoints[j] === $scope.selectedInspectionPoint) {
                                if (!$scope.inspectionDetails.crane.inspectionPoints[j].attributes.options)
                                {
                                    $scope.inspectionDetails.crane.inspectionPoints[j].attributes.options = [];
                                }
                                
                                $scope.inspectionDetails.crane.inspectionPoints[j].attributes.options.push(listOfItems[i]);
                                break;
                            }
                        }
                    }
                }
            }
        }

        $scope.selectInspectionPoint = function(selectedInspectionPoint) {
            $scope.selectedInspectionPoint = selectedInspectionPoint;
        }
    };


    app.controller("InspectionDetailsController", InspectionDetailsController);

}());
