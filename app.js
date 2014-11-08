
var app = angular.module('firebaseIDXDemo', ['firebaseIDX']);  // reference to Modul 'firebaseIDX' in firebaseindex.js


// set your Firebase Account here  or use for demonstration - https://fireindex.firebaseio.com/
var firebaseRef="https://fireindex.firebaseio.com/";


// CONTROLLER 
app.controller('appCtrl', ['$scope','firebaseIndex', '$timeout',  // use Service 'firebaseIndex' from Modul 'firebaseIDX'
    
function ($scope, firebaseIndex, $timeout) {
    'use strict';        
    
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
          
    // set independent References to DATA and INDEX 
    var refData = new Firebase(firebaseRef + "persons");       
    var refIDX = new Firebase(firebaseRef + "IDX");        
    
    // Create an Index Object 
    var FirebaseIdx=firebaseIndex(refData, indexOn, refIDX);
    // var FirebaseIdx=firebaseIndex(refData, indexOn); // take Default refIDX
    // ident -> var FirebaseIdx=new firebaseIndex(refData, indexOn [,refIDX]);
    
    // // Start automatic INDEXING here...
    FirebaseIdx.indexOn();
    
    // // add a Person to Firebase and watch Result in Chrome with Vulcane
    // refData.push(person);            
    
    //-------------------------------------------------------------------------------------
        
    $scope.person=person;
    $scope.indexOn=indexOn;
    
    $scope.query=function (term, index, sortup) {
      
        if(index === undefined || term.length<1) {
            $scope.persons=[];
            return;
        }
        
        // index -> {index: 'lastname',textMapper: lowerCaseFN}; // alternativ use indexOn[0]
        var termTo=term+'\uFFFF';

        // query returns a promise
        FirebaseIdx.queryFromTo(index , term, termTo, sortup)
        .then( function(result){
          $timeout(function(){$scope.persons=result; });  // instead of scope.$watch(...)                         
        });
    
    };
    
    
    $scope.onIDX=function () {

       FirebaseIdx.indexOn();

    };
    
    $scope.offIDX=function () {

       FirebaseIdx.indexOff();

    };
    
    $scope.recreateIDX=function () {

       FirebaseIdx.indexRecreate();

    };
    
    $scope.deleteIDX=function () {

       FirebaseIdx.indexDelete();

    };

    $scope.generatePersons=function () {
        
        var i;
        
        for (i=0; i < 10; i=i+1) {

            // Randomize names
            $scope.person.lastname = Math.random().toString(36).slice(6);
            
            // Randomize streets
            $scope.person.adress.street = Math.random().toString(36).slice(2);
            
            // add to firebase 
            refData.push($scope.person);    
            
        }    
    };
    
        
}]);