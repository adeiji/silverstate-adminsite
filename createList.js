// Code goes here

(function() {
    'use strict'

    var app = angular.module('InspectionDetailsViewer', ['ui.tree']);

    var InspectionDetailsController = function($scope, ParseHandler) {

        var CRANE_TYPE = "craneType";
        var INSPECTION_POINT = "inspectionPoint";
        var OPTION = "option";
        var BOTH = "both";

        ParseHandler.init();


        var init = function() {
            $scope.list = {
                "listOfItems": []
            };

            $scope.isInspectionPointList = false;
            $scope.isOptionList = false;
        }

        init();
        // Get all the inspection points from Parse
        var getInspectionPoints = ParseHandler.getAllObjectsFromParse(ParseHandler.INSPECTION_POINT_OBJECT).then(function(inspectionPoints) {
            $scope.inspectionPoints = [];
            $scope.inspectionPointsCopy = [];

            for (var i = 0; i < inspectionPoints.length; i++) {
                inspectionPoints[i].fetch({
                    success: inspectionPointFinishedFetch
                });

            };
        });

        var inspectionPointFinishedFetch = function(inspectionPoint) {
            $scope.inspectionPoints.push(inspectionPoint);
            $scope.inspectionPointsCopy.push(inspectionPoint);
        }

        // Get all the options from Parse
        var getOptions = ParseHandler.getAllObjectsFromParse(ParseHandler.OPTION_OBJECT).then(function(options) {
            $scope.options = options;
            $scope.optionsCopy = options;
        });

        ParseHandler.getAllObjectsFromParse(ParseHandler.LIST_OBJECT).then(function(lists) {
            $scope.savedLists = lists;
            $scope.$apply();
            
        })

        var listFinishedFetch = function(list) {
            fetchObjects(list);
            $scope.savedLists.push(list);
        }

        // Traverse through the object and fetch in property
        var fetchObjects = function(object) {
            var keys = Object.keys(object.attributes);
            for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                var objectAttribute = object.get(keys[keyIndex]);
                if (Array.isArray(objectAttribute)) {
                    for (var subObjectIndex = 0; subObjectIndex < objectAttribute.length; subObjectIndex++) {
                        objectAttribute[subObjectIndex].fetch({
                            success: fetchObjects
                        });
                    };
                }
            };

        }

        var getListType = function() {
            if ($scope.isInspectionPointList) {
                return INSPECTION_POINT;
            } else if ($scope.isOptionList) {
                return OPTION;
            }
        }

        // Create a list object and save it to Parse
        $scope.saveList = function(listName, selectedList) {
            if (!$scope.selectedList) {
                $scope.list.name = listName;
                $scope.list.type = getListType();
                var listObject = angular.copy(ParseHandler.createListParseObject($scope.list));
                $scope.savedLists.push(listObject);
            } else if ($scope.selectedList) {
                angular.copy($scope.selectedist).save(null, {
                    success : function (item) {
                        
                    },
                    error : function (error) {
                        alert(error);
                    }
                });             
                
            }
        }

        $scope.searchOptions = function (searchText) {

            if (searchText != '')
            {            
                var searchedOptions = [];
                for (var i = 0; i < $scope.optionsCopy.length; i++) {
                    if ($scope.optionsCopy[i].get("name").toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                        searchedOptions.push($scope.optionsCopy[i]);
                    }
                };

                $scope.options = searchedOptions;
            }
            else {
                $scope.options = $scope.optionsCopy;
            }
        }

        $scope.searchInspectionPoints = function (searchText) {

            if (searchText != '')
            {            
                var searchedInspectionPoints = [];
                for (var i = 0; i < $scope.inspectionPointsCopy.length; i++) {
                    if ($scope.inspectionPointsCopy[i].get("name").toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                        searchedInspectionPoints.push($scope.inspectionPointsCopy[i]);
                    }
                };

                $scope.inspectionPoints = searchedInspectionPoints;
            }
            else {
                $scope.inspectionPoints = $scope.inspectionPointsCopy;
            }
        }

        $scope.viewListDetails = function(selectedList) {

            $scope.list.listOfItems = [];
            // Get the list of items and then fetch them from the server so that we actually have the Parse Objects
            var listOfItems = selectedList.get("listOfItems");
            if (!listOfItems[0].attributes.name)
            {
                for (var i = 0; i < listOfItems.length; i++) {
                    listOfItems[i].fetch({
                        success: function (item) {
                            $scope.list.listOfItems.push(item);
                            $scope.$apply();
                        }
                    });
                };
            }
            else {
                for (var i = 0; i < listOfItems.length; i++) {
                    $scope.list.listOfItems.push(listOfItems[i]);
                }   
            }
            $scope.selectedList = selectedList;
            $scope.list.name = selectedList.attributes.name;

            if (selectedList.attributes.type === OPTION) {
                $scope.isOptionList = true;
                $scope.isInspectionPointList = false;
            } else if (selectedList.attributes.type === INSPECTION_POINT) {
                $scope.isInspectionPointList = true;
                $scope.isOptionList = false;                
            }

        }

        $scope.deleteList = function(selectedList) {
            var index = $scope.savedLists.indexOf(selectedList);
            $scope.savedLists.splice(index, 1);
            selectedList.destroy();
        }

        $scope.addSearchedItemToList = function () {
            $scope.addItemToInspectionList($scope.options[0]);
            $scope.crane.newOption = "";
        }

        $scope.addSearchedInspectionPointToList = function () {
            $scope.addItemToInspectionList($scope.inspectionPoints[0]);
            $scope.crane.newInspectionPoint = "";
        }        

        $scope.addItemToInspectionList = function(selectedItem, type) {
            var duplicate = false;

            for (var i = 0; i < $scope.list.listOfItems.length; i++) {
                if ($scope.list.listOfItems[i].attributes.name === selectedItem.attributes.name) {
                    duplicate = true;
                }
            }

            if (!duplicate) {
                $scope.list.listOfItems.push(selectedItem);
            }

            if ($scope.selectedList)
            {
                var listOfItems = $scope.selectedList.get("listOfItems");
                listOfItems.push(selectedItem);
                $scope.selectedList.set("listOfItems", listOfItems);
                angular.copy($scope.selectedList).save(null, {
                    success : function (item) {
                        
                    },
                    error : function (error) {
                        alert(error);
                    }
                });      
            }
        }

        $scope.removeItem = function(selectedItem) {
            var index = $scope.list.listOfItems.indexOf(selectedItem);
            $scope.list.listOfItems.splice(index, 1);

            if ($scope.selectedList)
            {
                var listOfItems = $scope.selectedList.get("listOfItems");
                listOfItems.splice(index, 1);
                $scope.selectedList.set("listOfItems", listOfItems);
                angular.copy($scope.selectedList).save(null, {
                    success : function (item) {
                        
                    },
                    error : function (error) {
                        alert(error);
                    }
                });      
            }
        }

        $scope.duplicateList = function(selectedList) {
            var selectedListCopy = angular.copy(selectedList);
            ParseHandler.createListParseObject(selectedListCopy);
            $scope.savedLists.push(selectedList);
        }

        $scope.resetList = function() {
            $scope.list.listOfItems = [];
            $scope.list.name = "";
            $scope.selectedList = null;
        }


        $scope.showSelectedListTypeInformation = function(type) {
            if (type === INSPECTION_POINT) {
                $scope.isOptionList = false;
                $scope.isInspectionPointList = true;
                getInspectionPoints();
            } else if (type === OPTION) {
                $scope.isOptionList = true;
                $scope.isInspectionPointList = false;
                getOptions();
            }

            $scope.list = {
                "listOfItems": []
            };
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

    app.controller("InspectionDetailsController", InspectionDetailsController);

}());
