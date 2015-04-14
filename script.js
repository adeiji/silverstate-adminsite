// Code goes here

(function() {
    'use strict'

    var app = angular.module('InspectionDetailsViewer', ['ui.tree']);

    var InspectionDetailsController = function($scope, ParseHandler) {

        var CRANE_TYPE = "craneType";
        var INSPECTION_POINT = "inspectionPoint";
        var OPTION = "option";

        ParseHandler.init();

        $scope.collapse = function(scope) {
            scope.toggle();
        };


        $scope.inspectionDetails = {};
  
        var getAllCranes = function() {
            $scope.craneTypes = [];
            ParseHandler.getAllObjectsFromParse(ParseHandler.CRANE_OBJECT).then(function(cranes) {

                for (var i = 0; i < cranes.length; i++) {                    
                    setCranes(cranes[i]);
                };

                $scope.$apply();

            });
        }

        var setCranes = function(crane) {
            
            $scope.craneTypes.push(crane);            
        }

         var getSavedLists = function () {
             ParseHandler.getAllObjectsFromParse(ParseHandler.LIST_OBJECT).then(function(lists) {
                $scope.savedLists = lists;            
                $scope.savedListsCopy = $scope.savedLists;

            });    
         }

        $scope.setRequiresDeficiency = function () {
            $scope.selectedInspectionPoint.set("requiresDeficiency", true);
            ParseHandler.saveParseObject(angular.copy(($scope.selectedInspectionPoint)));
        }

        var getFetchedOptions = function (scope, inspectionPoint, loc) {
            if (loc < inspectionPoint.attributes.options.length)
            {
                inspectionPoint.attributes.options[loc].fetch({
                    success : function (argument) {
                        getFetchedOptions(scope, inspectionPoint, loc+1);
                    }
                });
            }
            else {
                scope.toggle();
                scope.$apply();
            }
        }

        $scope.fetchOptions = function (scope, inspectionPoint) {
            if (!inspectionPoint.attributes.options[0].attributes.name)
            {
                getFetchedOptions(scope, inspectionPoint, 0);
            }
            else {
                scope.toggle();
            }
        }

        $scope.addCustomPrompt = function (prompt) {
            if (!$scope.selectedInspectionPoint.get("prompts"))
            {
                $scope.selectedInspectionPoint.set("prompts", []);
            }

            $scope.selectedInspectionPoint.get("prompts").push({ "name" : prompt });
            ParseHandler.saveParseObject(angular.copy(($scope.selectedInspectionPoint)));            
        }

        // Traverse through the object and fetch in property
        var fetchObjects = function(object) {
            var keys = Object.keys(object.attributes);
            for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                var objectAttribute = object.get(keys[keyIndex]);
                if (Array.isArray(objectAttribute)) {
                    for (var subObjectIndex = 0; subObjectIndex < objectAttribute.length; subObjectIndex++) {
                        objectAttribute[subObjectIndex].fetch();
                    };
                }
            };
        }

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

            if (selectedCrane)
            {
                $scope.showSavedLists = true;
                $scope.inspectionDetails.crane = selectedCrane;
                getSavedLists();
            }
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
                if (!selectedItem.attributes.inspectionPoints[0].attributes.name)
                {
                    fetchObjects(selectedItem);
                }
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

        $scope.searchLists = function (searchText) {
           if (searchText != '')
            {            
                var searchedItems = [];
                for (var i = 0; i < $scope.savedListsCopy.length; i++) {
                    if ($scope.savedListsCopy[i].get("name").toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                        searchedItems.push($scope.savedListsCopy[i]);
                    }
                };

                $scope.savedLists = searchedItems;
            }
            else {
                $scope.savedLists = $scope.savedListsCopy;
            } 
        }

        $scope.addSearchedList = function () {
            addList($scope.savedLists[0]);
        }

        // Add a list to the inspection, if it's an option list than add it under an inspection point if it's an inspection point add it under the crane
        $scope.addList = function(selectedList) {
            var listOfItems = selectedList.attributes.listOfItems;
            for (var i = 0; i < listOfItems.length; i++) {
                listOfItems[i].fetch();
            };
            for (var i = 0; i < listOfItems.length; i++) {
                if (selectedList.attributes.type === INSPECTION_POINT) {
                    if (!$scope.inspectionDetails.crane.attributes.inspectionPoints) {
                        $scope.inspectionDetails.crane.attributes.inspectionPoints = [];
                    }

                    $scope.inspectionDetails.crane.attributes.inspectionPoints.push(listOfItems[i]);
                } else if (selectedList.attributes.type === OPTION) {
                    if (!$scope.selectedInspectionPoint) {
                        $scope.error = "No Inspection Point Selected";
                    } else if ($scope.selectedInspectionPoint) {
                        for (var j = 0; j < $scope.inspectionDetails.crane.attributes.inspectionPoints.length; j++) {
                            if ($scope.inspectionDetails.crane.attributes.inspectionPoints[j] === $scope.selectedInspectionPoint) {
                                if (!$scope.inspectionDetails.crane.attributes.inspectionPoints[j].attributes.options) {
                                    $scope.inspectionDetails.crane.attributes.inspectionPoints[j].attributes.options = [];
                                }

                                $scope.inspectionDetails.crane.attributes.inspectionPoints[j].attributes.options.push(listOfItems[i]);
                                break;
                            }
                        }
                    }
                }
            }
        }

        $scope.saveInspection = function() {

            ParseHandler.saveInspection(angular.copy($scope.inspectionDetails.crane));
        }

        $scope.selectInspectionPoint = function(selectedInspectionPoint) {
            $scope.selectedInspectionPoint = selectedInspectionPoint;
        }
    };


    app.controller("InspectionDetailsController", InspectionDetailsController);

}());
