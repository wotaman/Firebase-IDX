(function(){

    'use strict';

    // Modul firebaseIDX  with Service firebaseIndex 
    var firebase = angular.module('firebaseIDX', []);

/*
// 0) Declare a Sample-Person

    var person={
        lastname: "Smith",
        firstname: "Frank"
        email: "frank.smith@fb.com",
        telefon:"12345-887766",
        adress: {
            street: 'Arlington Road 12',
            location: 'Seattle',
            state: 'US'
        }
    };

// 1) Declare your TextMapperFN ->  Function(term, textMapperArguments) {... modify your term...;  return modifiedTerm;} 

// Sample for a TextMapper Function 

    function upperCaseFN(term, textMapperArguments) {
        if(typeof term === 'object') return term[textMapperArguments];
        if(typeof term === 'string') return term.toUpperCase();
        //... convert your term in a priority you need for searching 
        
        return null;        
    }

// 2) Declare your Index Array for all the Properties you want to build an index 

var indexOn = [
    {
        index: 'lastname',
        textMapperFN: upperCaseFN,      // converts your value of Index into uppercase/ lowercase/ or any searchable and sortable mappedTerm 
                                        // this mappedTerm will become a priority in your dataset.  
                                        // (https://www.firebase.com/docs/web/api/firebase/setpriority.html) 
                                        //
                                        // Function Signatur:  mappedTerm = textMapperFN(term, textMapperArguments) 
                                        // finally your dataset will looks like:
                                        // Priority <- mappedTerm
                                        // Name <- FirebaseKey
                                        // Value <- term
    },
    {
        index: 'firstname',
        textMapperFN: upperCaseFN         // search will be not case sensitiv
    },
    {
        index: 'telefon',
        // textMapperFN: compactNumberFN     // mapping to trim and extract non numeric values
    },
    {
        index: 'email',
        // textMapperFN: getMailProviderFN   // make only the provider searchable
    },
    {
        index: 'adress',
        textMapperFN: upperCaseFN      // mappedTerm = textMapperFN(term, textMapperArguments)
        textMapperArguments: 'street'
    },
    {
        index: 'adress/street',
        textMapperFN: null                // no mapping wanted 
    }
];

// 3) Reference to your Data Firebase

var refPersons = new Firebase(https://[Your Firebase Account].firebaseio.com/persons");     

// 4) Reference to your Index Firebase (a Reference as child of refData is not allowed)
// Your Index can be referenced to another Firebase Account

var refIndex = new Firebase(https://[Your Firebase Account].firebaseio.com/IDX");        

// 5) Create IndexObject and activate Indexing 

var fbIdx=firebaseIndex(refPersons, indexOn, refIndex)

// use your Index-Object and switch Indexing ON

fbIdx.indexOn()             - start Indexing   
// fbIdx.indexOff()         - stop Indexing
// fbIdx.indexRecreate()    - if your Index is corrupt or not updated then recreate your Index 
// fbIdx.indexDelete()      - delete the Index

// 6) That's it! 
// Every Access (Set, Update, Remove) to your Firebase 'refPersons' will automatically update your IDX  
// try to add a dataset 
refPersons.push(person);  

Searching:

var sortUp=true;
var valueFrom="Sm";
var valueTo=valueFrom +'\uFFFF';
var index=indexOn[0];  // [{ index: 'lastname', textMapperFN: upperCaseFN } , ... ] 

fbIdx.queryFromTo(index, valueFrom, valueTo, sortUp)
    .then(function(result){                
            // instead of  '$scope.watch' use shorthand '$timeout'   
        $timeout(function(){$scope.result = result;});            
    })

// // Try also 
// fbIdx.queryFromTo(index, valueFrom, valueTo, sortUp)
// fbIdx.queryStartAt(index, startAt, limit, sortUp)
// fbIdx.queryEndAt(index, endAt, limit, sortUp)
// fbIdx.queryFirst(index, startAt)
// fbIdx.queryLast(index, endAt)

*/

    firebase.factory('firebaseIndex', [
        function (){
            
            // FACTORY - Return your FirebaseIndex Object with or without 'new'
            return function (ref, indexOn, refIndex) {

            // Local Vars
            var reference, 
                referenceIndex,
                referenceIndexDefaultName="IDX",
                indexOnArray,
                resultArr=[],
                refChildAdded,
                refChildRemoved,
                refChildChanged;
            
            // local funcs
            function isFunction(fn){
                return (typeof fn === 'function');
            }
            function indexHandle(refIndex, indexOn, snapshot, remove) {

                //console.log("indexHandle", indexOn, refIndex.path)

                var idx,
                    textMapperFN,
                    textMapperArguments,                    
                    priority,
                    snapValue=snapshot.val();  

                if (snapValue === undefined ) {return; }    // ILLEGAL INDEX PROPERTY 

                // iterate indexOn Array 
                indexOn.forEach(function (ix) {

                    var value=snapValue;

                    idx = ix.index;
                    textMapperFN= isFunction(ix.textMapperFN) ? ix.textMapperFN: function(i){return i;}; 
                    textMapperArguments= ix.textMapperArguments;                     

                    /*
                        If your Index is a nested path like { index: 'adress/street' }
                        get the value from the rightest child in the path and extract here the value of 'street'
                    */                    
                    ix.index.trim().split("/").forEach(function(i){  
                        value=value ? value[i] : null;
                    });

                    if (value === undefined || value === null) {return; }    // ILLEGAL INDEX PROPERTY 

                    priority=textMapperFN(value, textMapperArguments);            
                    if (typeof priority === 'object') {return;}         // JSON OBJECT not allowed for priority (can be solved in textMapperFN)
                    // if (typeof priority === 'boolean') {return; }       // BOOLEAN NOT FOR INDEXING
                    if (typeof priority === 'function') {return; }      // FUNCTION NOT FOR INDEXING

                    // remove Flag - removes Dataset 
                    if (remove) {value=null; }

                    // ADD  - UPDATE - REMOVE
                    // console.log("HANDLE IDX:", idx, snapshot.name(),"PRIORITY:", priority, " VALUE:",value, "------------------")
                    refIndex.child(idx).child(snapshot.name()).setWithPriority(value, priority);

                });
            } 
            function queryUp(ref, dataSnapshot){       

                dataSnapshot.forEach(function(i){
                    ref.child(i.name()).once('value', function (dataSnapshot) {  
                            resultArr.push(dataSnapshot.val());                             
                    });
                });                
                //console.log("### resultArr ", resultArr)                        
                return resultArr;
            }    
            function queryDown(ref, dataSnapshot){

                dataSnapshot.forEach(function(i){
                    ref.child(i.name()).once('value', function (dataSnapshot) {               
                        resultArr.unshift(dataSnapshot.val()); 
                    });
                });

                return resultArr;
            }               
            function queryDo(ref, queryRef ,sort) {

                resultArr=[];

                return new Promise(function (resolve, reject) {
                    queryRef.once('value', function (dataSnapshot) { 
                        if(sort==false) {resolve(queryDown(ref, dataSnapshot )); return;} //  == accepts all false values 
                        resolve(queryUp(ref, dataSnapshot ));                    
                    }, function (errorObject) {
                        reject(errorObject);
                    });

                });
            }        

            // if refIndex is undefined generate IDX as Child of your Data with Name 'referenceIndexDefaultName'
            if(refIndex=== undefined) {refIndex=ref.parent().child(referenceIndexDefaultName);}
            // set Ref's intern variable             
            reference=ref;
            referenceIndex=refIndex;
            indexOnArray=indexOn;
 
            var self = {};

            self.indexOn=function(){
                // ref = new Firebase(data.firebase.../Data);
                // indexOn = [ {index:lastname, textMapperFN: toUpperFN}, {index:firstname} ]
                // refIndex = new Firebase(idx.firebase.../Data/IDX);
                var firstRun=true;

                if(refChildAdded || !referenceIndex || !reference) {return;}
                
                // set events    
                refChildAdded=reference.limit(1).on('child_added', function (dataSnapshot) {
                    if(firstRun===false) {indexHandle(refIndex, indexOn, dataSnapshot); }
                    firstRun=false;
                });
                   
                refChildRemoved=reference.on('child_removed', function (dataSnapshot) {
                    indexHandle(refIndex, indexOn, dataSnapshot,true);
                });

                refChildChanged=reference.on('child_changed', function (dataSnapshot) {
                    indexHandle(refIndex, indexOn, dataSnapshot);
                });

            };

            self.indexOff=function(){

                 if(!referenceIndex || !reference) {return;}

                // set events    
                reference.off('child_added', refChildAdded);

                reference.off('child_removed', refChildRemoved);

                reference.off('child_changed', refChildChanged);

                refChildAdded=null;
                
            };

            self.indexDelete=function(){

                if(!referenceIndex || !reference) {return;}                
            
                referenceIndex.set(null);
            
            };

            self.indexRecreate=function(){
                // ref = new Firebase(data.firebase.../Data);
                // indexOn = [ {index:lastname, textMapperFN: toUpperFN}, {index:firstname} ]
                // refIndex = new Firebase(idx.firebase.../Data/IDX);

                if(!referenceIndex || !reference) {return;}

                referenceIndex.set(null, function(){
                    //     set events    
                    var refRecreate=reference.on('child_added', function (dataSnapshot) {
                        indexHandle(referenceIndex, indexOnArray, dataSnapshot);
                    });
                    // switch off recreation Reference
                    reference.off('child_added', refRecreate);  
                
                });

            };
            
            // QUERY
                
            self.queryFromTo = function(index, startAt, endAt, sort ) {

                var textFN= isFunction(index.textMapperFN) ? index.textMapperFN: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).endAt(textFN(endAt) );     
                return queryDo(reference, queryRef, sort); // Promise
            };

            self.queryStartAt = function(index, startAt, limit, sort) {            

                var textFN= isFunction(index.textMapperFN) ? index.textMapperFN: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).limit(limit);            
                return queryDo(reference, queryRef,sort);  // Promise
            };

            self.queryEndAt = function(index, endAt, limit, sort) {            

                var textFN= isFunction(index.textMapperFN) ? index.textMapperFN: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).endAt(textFN(endAt)).limit(limit);            
                return queryDo(reference, queryRef,sort); // Promise
            };

            self.queryFirst = function(index, startAt) {            

                var textFN= isFunction(index.textMapperFN) ? index.textMapperFN: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).limit(1);            
                return queryDo(reference, queryRef,true); // Promise
            };

            self.queryLast = function(index, endAt) {            

                var textFN= isFunction(index.textMapperFN) ? index.textMapperFN: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).endAt(textFN(endAt)).limit(1);            
                return queryDo(reference, queryRef,true); // Promise
            };

            return self;

        };

     }]);
        
}());
