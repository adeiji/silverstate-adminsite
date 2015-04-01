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
        

        var init = function () {
            $scope.list = {
                "listOfItems": []
            };

            $scope.isInspectionPointList = false;
            $scope.isOptionList = false;   
        }

        init();
        // Get all the inspection points from Parse
        ParseHandler.getAllObjectsFromParse(ParseHandler.INSPECTION_POINT_OBJECT).then(function(inspectionPoints) {
            $scope.inspectionPoints = [];

            for (var i = 0; i < inspectionPoints.length; i++) {
                $scope.inspectionPoints.push(inspectionPoints[i]);
            };
        });

        // Get all the options from Parse
        ParseHandler.getAllObjectsFromParse(ParseHandler.OPTION_OBJECT).then(function(options) {
            $scope.options = options;
        });

        ParseHandler.getAllObjectsFromParse(ParseHandler.LIST_OBJECT).then(function(lists) {
            $scope.savedLists = lists;
        })

        var getListType = function () {
            if ($scope.isInspectionPointList)
            {
                return INSPECTION_POINT;
            }
            else if ($scope.isOptionList)
            {
                return OPTION;
            }
        }

        // Create a list object and save it to Parse
        $scope.saveList = function(listName, selectedList) {
            if (!$scope.isUpdate)
            {
                $scope.list.name = listName;
                $scope.list.type = getListType();
                var listObject = angular.copy(ParseHandler.createListParseObject($scope.list));
                $scope.savedLists.push(listObject);
            }
            else {
                angular.copy(selectedList).save();
            }
        }

        $scope.viewListDetails = function(selectedList) {
            if (selectedList)
            {
                $scope.isUpdate = true;
            }
            
            $scope.list.listOfItems = [];
            // Get the list of items and then fetch them from the server so that we actually have the Parse Objects
            var listOfItems = selectedList.get("listOfItems");
            for (var i = 0; i < listOfItems.length; i++) {
                listOfItems[i].fetch();
            };
            
            for (var i = 0; i < listOfItems.length; i++) {
                $scope.list.listOfItems.push(listOfItems[i]);
            };

            $scope.list.name = selectedList.attributes.name;

            if (selectedList.attributes.type === OPTION)
            {
                $scope.isOptionList = true;
                $scope.isInspectionPointList = false;
            }
            else if (selectedList.attributes.type === INSPECTION_POINT)
            {
                $scope.isInspectionPointList = true;
                $scope.isOptionList = false;
            }

        }

        $scope.deleteList = function (selectedList) {
            var index = $scope.savedLists.indexOf(selectedList);
            $scope.savedLists.splice(index, 1);
            selectedList.destroy();
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
        }

        $scope.remove = function (selectedItem) {
            var index = $scope.list.listOfItems.indexOf(selectedItem);
            $scope.list.listOfItems.splice(index, 1);
        }

        $scope.duplicateList = function (selectedList) {
            var selectedListCopy = angular.copy(selectedList);
            ParseHandler.createListParseObject(selectedListCopy);
            $scope.savedLists.push(selectedList);
        }

        $scope.showSelectedListTypeInformation = function (type) {
            if (type === INSPECTION_POINT)
            {
                $scope.isOptionList = false;
                $scope.isInspectionPointList = true;
            }
            else if (type === OPTION) {
                $scope.isOptionList = true;
                $scope.isInspectionPointList = false;
            }

            $scope.list = {
                "listOfItems": []
            };
        }
    };

    app.controller("InspectionDetailsController", InspectionDetailsController);

}());