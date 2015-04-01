(function() {
    'use strict'

    var ParseHandler = function() {

        var CRANE_OBJECT = "Crane";
        var OPTION_OBJECT = "Option";
        var INSPECTION_POINT_OBJECT = "InspectionPoint";
        var LIST_OBJECT = "List";
        
        var init = function() {
            Parse.initialize("pXYoDYstnZ7wvICh2nNtxmAwegOpjhsdRpFjNoVE", "2Yd2KvW50IAZeWIhnwH0b00kE8TvyOFN3bz4QYTQ");
        }

        // Get all the cranes from the server
        var getAllObjectsFromParse = function (parseClass) {
            var ParseClass = Parse.Object.extend(parseClass);
            var query = new Parse.Query(ParseClass);
            return query.find({
                success: function (objects) {
                           
                },
                error: function (objects, error) {
                    alert('Error retreiving the cranes: ' + error.description);
                }
            });
        }

        // Get all the crane information from the server
        var getAllInspectionSpecs = function () {
            
            getAllObjectsFromParse(CRANE_TABLE);
            getAllObjectsFromParse(OPTION_TABLE);
            getAllObjectsFromParse(INSPECTION_POINT_TABLE);
        }

        var createCraneParseObject = function(craneName) {
            var Crane = Parse.Object.extend("Crane");
            var crane = new Crane();
            crane.set("name", craneName);
            saveParseObject(crane);
            
            return crane;
        }
        
        var createInspectionPointParseObject = function (inspectionPointName) {
            var InspectionPoint = Parse.Object.extend("InspectionPoint");
            var inspectionPoint = new InspectionPoint();
            inspectionPoint.set("name", inspectionPointName)
            saveParseObject(inspectionPoint);
            
            return inspectionPoint;
        }
        
        var createOptionParseObject = function (optionName) {
            var Option = Parse.Object.extend("Option");
            var option = new Option();
            option.set("name", optionName);
            saveParseObject(option);
            
            return option;
        }
        
        var createListParseObject = function (listObject) {
            var List = Parse.Object.extend("List");
            var list = new List();
            if (!listObject.attributes)
            {
                list.set("name", listObject.name);
                list.set("listOfItems", listObject.listOfItems);
                list.set("type", listObject.type);
                saveParseObject(list);
            }
            else {
                list.set("name", listObject.get("name"));
                list.set("listOfItems", listObject.get("listOfItems"));
                list.set("type", listObject.get("type"));
                saveParseObject(list);
            }
            
            return list;
        }

        var saveInspection = function  (inspection) {
            var inspectionPoints = inspection.attributes.inspectionPoints; 
            for (var i = 0; i < inspectionPoints.length; i++) {
                inspectionPoints[i].fetch();
                if (inspectionPoints[i].get('options'))
                {
                    var options = inspectionPoints[i].get('options');
                    for (var j = 0; j < options.length; j++) {
                        options[j].fetch();
                    };
                    inspectionPoints[i].set('options', options);
                }
            };

            inspection.set("inspectionPoints", inspectionPoints);
            saveParseObject(inspection);
        }
        
        var saveParseObject = function (object) {
            return object.save(null, {
                success: function (object) {
                    // Any logic that should take place after the object is saved
                },
                error: function (object, error) {
                    // Display to the user that there was an error
                    alert('Failed to save the new object: ' + error.message);
                }
            });
        }

        return {
            init: init,
            createCraneParseObject: createCraneParseObject,
            createInspectionPointParseObject : createInspectionPointParseObject,
            createOptionParseObject : createOptionParseObject,
            saveParseObject : saveParseObject,
            getAllObjectsFromParse : getAllObjectsFromParse,
            createListParseObject : createListParseObject,
            saveInspection : saveInspection,
            CRANE_OBJECT : CRANE_OBJECT,
            OPTION_OBJECT : OPTION_OBJECT,
            INSPECTION_POINT_OBJECT : INSPECTION_POINT_OBJECT,
            LIST_OBJECT : LIST_OBJECT
        };
    }

    var module = angular.module("InspectionDetailsViewer");
    module.factory("ParseHandler", ParseHandler);

}());