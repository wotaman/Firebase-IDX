(function(){

    'use strict';

    // Angular Modul firebaseIDX  with Service firebaseIndex 
    var firebase = angular.module('firebaseIDX', []);

/*
    //  Sample Person
    {
        name: "Smith",
        firstname: "Frank"
        email: "frank.smith@fb.com",
        telefon:"12345-887766",
        adress: {
            street: 'Darlington Road 12',
            location: 'Seattle',
            state: 'US'
        }
    };

// 1) Declare your TextMapper ->  Function(term) {... modify your term...;  return modifiedTerm;} 
// Sample textMapper function 
    function upperCaseFN(term) {
        if(typeof term === 'string') return term.toUpperCase();
        return null;        
    }

// 2) Declare your Index Array for all the Properties you want to build an index 
var indexOn = [
    {
        index: 'name',
        textMapper: upperCaseFN     // converts your value of Index into uppercase/ lowercase/ or any searchable and sortable term 
                                    // this term will be written to priority.  
                                    // https://www.firebase.com/docs/web/api/firebase/setpriority.html 
    },
    {
        index: 'firstname',
        textMapper: upperCaseFN
    },
    {
        index: 'telefon',
        textMapper: compactNumberFN     // mapping to trim and extract non numeric values
    },
    {
        index: 'email',
        textMapper: getMailProviderFN
    },
    {
        index: 'adresse',
        textMapper: firstPropertyOfObjectFN
    },
    {
        index: 'adresse/Strasse',
        textMapper: null            // no mapping wanted
    }
];

// 3) Reference to your Data Firebase
var refData = new Firebase(https://YourFirebaseAccount.firebaseio.com/persons");     

// 4) Reference to your Index Firebase (a Reference as child of refData is not allowed)
var refIndex = new Firebase(https://YourFirebaseAccount.firebaseio.com/IDX");        

// 5) Activate Indexing 
firebaseIndex.indexOn(refPersons, indexOn, refIndex)

// ) that's it! every access (set, update, remove) to your Firebase refData will automatic update the Index  


Searching:

var sortUp=true;
var valueFrom="S";
var valueTo="S"+'\uFFFF';
var index=indexOn[0];  // { index: 'name', textMapper: upperCaseFN }  


// queryFromTo will return a promise 
firebaseIndex.queryFromTo( index, valueFrom, valueTo, sortUp)
    .then(function(result){                
            // using $scope in angular simplest way to wrap it into a  $timeout   
        $timeout(function(){$scope.result = result;});            
    })

*/

    firebase.factory('firebaseIndex', [
        function () {

            // local var
            var reference; 
            var referenceIndex; 
            var indexOnArray;
            
            // local func
            function isFunction(fn){
                return (typeof fn === 'function');
            }
            
            function indexHandle(refIndex, indexOn, snapshot, remove) {
                
                indexOn.forEach(function (ix) {

                    var idx = ix.index;
                    var textMapperFN= isFunction(ix.textMapper) ? ix.textMapper: function(i){return i;}; 
                   
                    var value=snapshot.val();
                    if (typeof value === 'undefined') {return; }    // ILLEGAL INDEX PROPERTY 
                    
                    /*
                        If your Index is a nested path like { index: 'adress/street' }
                        then take the value of the last child in the path and extract here the value of 'street'
                    */
                    ix.index.trim().split("/").forEach(function(i){
                        value=value[i];
                    });
                    
                    if (typeof value === 'undefined') {return; }    // ILLEGAL INDEX PROPERTY 
                    
                    var priority=textMapperFN(value);            
                    if (typeof priority === 'object') {return;}         // JSON OBJECT not allowed for priority (can be solved in textMapperFN)
                    if (typeof priority === 'boolean') {return; }       // BOOLEAN NOT FOR INDEXING
                    if (typeof priority === 'function') {return; }      // FUNCTION NOT FOR INDEXING

                    // remove Flag - removes db entry
                    if (remove) {value=null; }

                    // ADD  - UPDATE - REMOVE
                    refIndex.child(idx).child(snapshot.name()).setWithPriority(value, priority);

                });
            } 
            
            function queryUp(ref, dataSnapshot){       
                var result=[];
                dataSnapshot.forEach(function(i){
                    ref.child(i.name()).once('value', function (dataSnapshot) { 
                        result.push(dataSnapshot.val());                             
                    });
                });
                return result;
            }
            
            function queryDown(ref, dataSnapshot){
                var result=[];
                dataSnapshot.forEach(function(i){
                    ref.child(i.name()).once('value', function (dataSnapshot) {               
                        result.unshift(dataSnapshot.val()); 
                    });
                });
                return result;
            }
            
            function queryDo(ref,refIndex ,sort) {

                return new Promise(function (resolve, reject) {
                    refIndex.once('value', function (dataSnapshot) { 
                        if(sort==false) {resolve(queryDown(ref, dataSnapshot)); return;} //  == accepts all false values 
                        resolve(queryUp(ref, dataSnapshot));                    
                    }, function (errorObject) {
                        reject(errorObject);
                    });

                });
            }        

            // -------------------------------------------------------------------------------------     
            
            var self = {};

            self.indexOn=function(ref, indexOn, refIndex ){
                // ref = new Firebase(data.firebase.../Data);
                // indexOn = [ {index:lastname, textMapper: toUpperFN}, {index:firstname} ]
                // refIndex = new Firebase(idx.firebase.../Data/IDX);

                // if refIndex undefined generate IDX as Child of your Data
                if(!refIndex) {refIndex=ref.parent().child("IDX");}
                // set Ref's intern variable             
                reference=ref;
                referenceIndex=refIndex;
                indexOnArray=indexOn;

                // set events    
                reference.limit(1).on('child_added', function (dataSnapshot) {
                    indexHandle(refIndex, indexOn, dataSnapshot);
                });

                reference.on('child_removed', function (dataSnapshot) {
                    indexHandle(refIndex, indexOn, dataSnapshot,true);
                });

                reference.on('child_changed', function (dataSnapshot) {
                    indexHandle(refIndex, indexOn, dataSnapshot);
                });

            };

            self.indexRecreate=function(){
                // ref = new Firebase(data.firebase.../Data);
                // indexOn = [ {index:lastname, textMapper: toUpperFN}, {index:firstname} ]
                // refIndex = new Firebase(idx.firebase.../Data/IDX);

                if(!referenceIndex || !reference) {return;}

                referenceIndex.set(null, function(){
                    //     set events    
                    reference.on('child_added', function (dataSnapshot) {
                        indexHandle(referenceIndex, indexOnArray, dataSnapshot);
                    });

                });

            };

            
            
            self.queryFromTo = function(index, startAt, endAt, sort ) {

                var textFN= isFunction(index.textMapper) ? index.textMapper: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).endAt(textFN(endAt));     
                
                return queryDo(reference, queryRef,sort); // Promise
            };

            self.queryStartAt = function(index, startAt, limit, sort) {            

                var textFN= isFunction(index.textMapper) ? index.textMapper: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).limit(limit);            
                return queryDo(reference, queryRef,sort);  // Promise
            };

            self.queryEndAt = function(index, endAt, limit, sort) {            

                var textFN= isFunction(index.textMapper) ? index.textMapper: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).endAt(textFN(endAt)).limit(limit);            
                return queryDo(reference, queryRef,sort); // Promise
            };

            self.queryFirst = function(index, startAt) {            

                var textFN= isFunction(index.textMapper) ? index.textMapper: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).startAt(textFN(startAt)).limit(1);            
                return queryDo(reference, queryRef,true); // Promise
            };

            self.queryLast = function(index, endAt) {            

                var textFN= isFunction(index.textMapper) ? index.textMapper: function(i){return i;}; 
                var queryRef=referenceIndex.child(index.index).endAt(textFN(endAt)).limit(1);            
                return queryDo(reference, queryRef,true); // Promise
            };

            return self;

    }]);

}());
