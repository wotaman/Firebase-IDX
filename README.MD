# Firebase Index - an AngularJs Modul #


### Search and sortable Indices (Priorities) in your Firebase DB
----------


This is a 'quick and dirty' prototype, which should help to explore the opportunities of Firebase. 


### Sample Person Object
    
	> var person = {
	>         lastname: "Smith",
	>         firstname: "Frank"
	>         email: "frank.smith@fb.com",
	>         telefon:"12345-887766",
	>         adress: {
	>             street: 'Darlington Road 12',
	>             location: 'Seattle',
	>             state: 'US'
	>         }
	>     };


### Declare a TextMapper Function

	> Function TextMapper(term) {... modify your term...;  return modifiedTerm;} 

Sample textMapper function 

	> function upperCaseFN(term) {
	>     if(typeof term === 'string') return term.toUpperCase();
	>     return null;        
	> }

### Declare an Index Array for any Property you want to generate an Index 

	> var indexOn = [
	>     {
	>         index: 'lastname',
	>         textMapper: upperCaseFN
	>     },
	>     {
	>         index: 'adresse/Strasse',     // you can nest your index
	>         // no mapping wanted
	>     }
	> ]; 

converts your value of 'lastname' into uppercase/ lowercase/ or any searchable and sortable term 


### Reference to your Data Firebase


	> var refData = new Firebase(https://YourFirebaseAccount.firebaseio.com/persons");     

### Reference to your Index Firebase 

Set an Index-Reference as child of your Data-Reference is not allowed)


	> var refIndex = new Firebase(https://YourFirebaseAccount.firebaseio.com/IDX");        

### Activate Indexing 


	> firebaseIndex.indexOn(refPersons, indexOn, refIndex)

### That's it! 

Every access (set, update, remove) to your Firebase refData will update your Index. Try to add your sample Person to your Firebase refData



	> refData.push(person); 

  

Searching:

	> var sortUp=true;
	> var valueFrom="S";
	> var valueTo="S"+'\uFFFF';
	> var index=indexOn[0];  // { index: 'lastname', textMapper: upperCaseFN }  
	> 
	> 
	> // queryFromTo() return a Promise
	>  
	> firebaseIndex.queryFromTo( index, valueFrom, valueTo, sortUp)
	>     .then(function(result){         
	>         ...use result...       
	>     })
     
	
Search Functions, return a Promise

	> queryFromTo(index, startAt, endAt, sort ).then(...);
	> queryStartAt(index, startAt, limit, sort).then(...); 
	> queryEndAt(index, endAt, limit, sort).then(...); 
	> queryFirst(index, endAt).then(...) ;
	> queryLast(index, endAt).then(...);

ReBuild the Index

	> indexRecreate();