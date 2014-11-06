'use strict';

var app = angular.module('firebaseIDXDemo', ['firebaseIDX']);  // reference to Modul 'firebaseIDX' in firebaseindex.js


// set your Firebase Account here  or use for demonstration - https://fireindex.firebaseio.com/
var firebaseRef="https://fireindex.firebaseio.com/";


// CONTROLLER 
app.controller('appCtrl', ['$scope','firebaseIndex', '$timeout',  // use Service 'firebaseIndex' from Modul 'firebaseIDX'
    
function ($scope, firebaseIndex, $timeout) {
        
    var person={
        lastname: "Smith",
        firstname: "Frank",
        adress: {
            street: 'Long Road 100',
            location: 'Seattle',
            state: 'US'
        }
    };
    
    function lowerCaseFN(term) {
        if(typeof term === 'string') {return "  "+ term.toLowerCase();}
        return null;        
    }
         
    var indexOn = [    
        {
            index: 'lastname',                
            textMapper: lowerCaseFN
        },
        {
            index: 'adress/street',
            textMapper: lowerCaseFN
        }
    ];
          
    // set References to DATA and INDEX 
    var refData = new Firebase(firebaseRef + "persons");       
    var refIDX = new Firebase(firebaseRef + "IDX");        
    
    // Start INDEXING here
    firebaseIndex.indexOn(refData, indexOn,refIDX);
    
    // add a Person to Firebase and watch Result in Chrome with Vulcane
    refData.push(person);            
    
    
    //-------------------------------------------------------------------------------------
    
    
    $scope.person=person;
    
    
    $scope.queryLastname=function (term) {
      
        $scope.person.adress.street="";
        
        var index={index: 'lastname',textMapper: lowerCaseFN}; // alternativ use indexOn[0]
        var from=term;
        var to=term+'\uFFFF';
        var sortUp=true;

        // query returns a promise
        firebaseIndex.queryFromTo(index , from, to, sortUp)
        .then( function(result){
          $timeout(function(){$scope.persons=result; });  // instead of scope.$watch(...)                         
        });
    
    };

    
    $scope.queryStreetOfAdress=function (term) {
      
        $scope.person.lastname="";
         
        // query returns a promise
        firebaseIndex.queryFromTo(indexOn[1] , term, term+'\uFFFF', true)
        .then( function(result){
          $timeout(function(){$scope.persons=result; });  // instead of scope.$watch(...)                         
        });
    
    };
    
    
    $scope.recreateIDX=function () {
        
       firebaseIndex.indexRecreate();
    
    };

    
    $scope.generatePersons=function () {
        
        var i;
        
        for (i=0; i < 100; i++) {

            // Randomize names
            $scope.person.lastname = Math.random().toString(36).slice(6);
            
            // Randomize streets
            $scope.person.adress.street = Math.random().toString(36).slice(2);
            
            // add to firebase 
            refData.push($scope.person);    
            
        }    
    };
    
        
}]);