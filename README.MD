
---

###This Project is DEPRECATED! ->  follow new project 'Firebase-IndexView'


---

### Firebase-IDX 

####An AngularJs Modul for auto-indexing your Firebase. 

####Search for any indexed Property of your Objects stored in Firebase
  




This is a 'quick and dirty' rapid prototyp, which should help to explore the opportunities of Firebase. A Database-Concept which is wonderful - Thanks to the Firebase Developer! 


----------

### Sample Person Object
    
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


### Declare a Textmapper Function
Converts your indexed Term into an uppercase/ lowercase/ or any searchable and sortable mappedTerm. This mappedTerm will become a priority in your dataset. For Details to Priority (https://www.firebase.com/docs/web/api/firebase/setpriority.html) 

mappedTerm = textMapperFN(Term, textMapperArguments) 

finally your dataset will looks like:
mappedTerm -> Priority 
FirebaseKey -> Name
Term -> Value
	
> Function(term, textMapperArguments) {
> 
> ... modify your term...;  
> 
> return mappedTerm;
> 
> }

Sample textMapper Function 

	function upperCaseFN(term, textMapperArguments) {

        if(typeof term === 'object') return term[textMapperArguments];
        
		if(typeof term === 'string') return term.toUpperCase();
        
		//... convert your term in a priority you need for searching 
        
        return null;        
    }

### Declare an Index Array 
Declare your Index Array for all the Properties of your Data, these Properties will be automatically indexed and you can query them

	var indexOn = [
	    {
	        index: 'lastname',
	        textMapperFN: upperCaseFN,      // converts your indexed into an uppercase mappedTerm 
	   	},
	    {
	        index: 'firstname',
	        textMapperFN: upperCaseFN         // search will be not case sensitiv
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
 


### Reference your Data for indexing on Firebase


	var refData = new Firebase("https://YourFirebaseAccount.firebaseio.com/persons");     

### Reference your Index on Firebase 

Set an Index-Reference as child of your Data-Reference is not allowed. But your Index can well be referenced to another Firebase Account


	var refIndex = new Firebase("https://YourFirebaseAccount.firebaseio.com/IDX");        

### Create an IndexObject 

	var FirebaseIdx=firebaseIndex(refPersons, indexOn, refIndex)

 	//	or

	var FirebaseIdx=firebaseIndex(refData, indexOn); // take Default refIDX

    //	or

	var FirebaseIdx=new firebaseIndex(refData, indexOn [,refIDX]);
    

### Activate Indexing 
Use your Index-Object 'FirebaseIdx' 

FirebaseIdx.indexOn()          - start Indexing   

FirebaseIdx.indexOff()         - stop Indexing

FirebaseIdx.indexRecreate()    - if your Index is corrupt or not updated then recreate your Index 

FirebaseIdx.indexDelete()      - delete the Index

	FirebaseIdx.indexOn()

### That's it! 

Every Access (Set, Update, Remove) to your Firebase 'refPersons' will automatically update your Index. 

Try to add your 'Sample Person' to your Firebase refData



	> refData.push(person); 

  

### Try Searching:

	var sortUp=true;
	var valueFrom="S";
	var valueTo=valueFrom +'\uFFFF';
	var index=indexOn[0];  // { index: 'lastname', textMapper: upperCaseFN }  
	 
	//queryFromTo() return a Promise
  
	FirebaseIdx.queryFromTo( index, valueFrom, valueTo, sortUp)
	.then(function(result){         
	         ...use result...       
	})
     
	
Quering Functions, return always a Promise. Try also

> FirebaseIdx.queryFromTo(index, startAt, endAt, sort ).then(...);
> 
> FirebaseIdx.queryStartAt(index, startAt, limit, sort).then(...); 
> 
> FirebaseIdx.queryEndAt(index, endAt, limit, sort).then(...); 
> 
> FirebaseIdx.queryFirst(index, endAt).then(...) ;
> 
> FirebaseIdx.queryLast(index, endAt).then(...);

### Using the Index

Methods of Index Object for handling Index 

.indexOn()             - start Indexing

	FirebaseIdx.indexOn()    

.indexOff()         	- stop Indexing

	FirebaseIdx.indexOff()

.indexRecreate()    	- if your Index is corrupt, inconsistent or deleted then recreate your Index 

	FirebaseIdx.indexRecreate()

.indexDelete()      	- delete all Index Data

	> FirebaseIdx.indexDelete();

