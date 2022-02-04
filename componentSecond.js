import { LightningElement, track, wire, api} from 'lwc';

import fetchBooks2 from '@salesforce/apex/Book.fetchBooks2';
import fetchBooks from '@salesforce/apex/Book.fetchBooks';

import { NavigationMixin } from 'lightning/navigation';

export default class componentSecond extends NavigationMixin(LightningElement) {
    value1='';
    @track searchKey;
    @track totalRecords = 'Number of Records';
    @track tableData;
    //@track tableDataToShow;
    @track searchBy;
    @track result1 = 'Available Book List';
    @track limit='Select Limits..';
    @track pagePicklist=[
        {label:10,value:10},
        {label:20,value:20},
        {label:30,value:30},
        {label:40,value:40},
        {label:50,value:50},
        {label:60,value:60},
        {label:70,value:70},
        {label:80,value:80},
    ];

    @track buttonOptions = [
        {label:'Name', value:1},
        {label:'ISBN', value:2},
        {label:'Author', value:3}
    ];

    @track pageSize = 5;//number of records on a page
    @track page = 1;
    @track totalRecordCount;
    @track totalPage;
    @track item1;
    @track endingRecord;
    @track startingRecord =1;

    connectedCallback(){
        fetchBooks()
        .then(data =>{
            if(data){
                //this.tableData = data;
                this.item1 = data;
                this.totalRecordCount = data.length;
                this.totalPage = Math.ceil(this.totalRecordCount / this.pageSize);
                this.tableData = this.item1.slice(0,this.pageSize);
                if(this.pageSize > this.totalRecordCount){
                    this.endingRecord = this.totalRecordCount;
                }else{
                    this.endingRecord = this.pageSize;
                }
                //this.totalRecords = 'Number of Records Available {'+this.tableData.length+'}';
            }
        })
    }
    changecolor(event){
        let number = event.detail.value;
        console.log('>> '+number);
        this.searchKey = null;
        //this.tableData = null;

        if(number==1){
            this.searchBy = number;
            //this.result1 = 'Search Result Sorted by Name';
        }
        else if(number==2){
            this.searchBy = number;
            //this.result1 = 'Search Result Sorted by ISBN';
        }
        else if(number==3){
            this.searchBy = number;
        }
    }

    fetchingBooks(){
        fetchBooks2({searchBy:this.searchBy, searchKey:this.searchKey})
            .then(result =>{
                this.item1 = result;
                this.totalRecordCount = result.length;
                this.totalPage = Math.ceil(this.totalRecordCount / this.pageSize);
                this.tableData = this.item1.slice(0,this.pageSize);
                if(this.pageSize > this.totalRecordCount){
                    this.endingRecord = this.totalRecordCount;
                }else{
                    this.endingRecord = this.pageSize;
                }
            })
    }
    fetchDetails(event){
        console.log('Search By '+this.searchBy);
        let key = event.detail.value;
        this.searchKey = key;
        console.log('key '+this.searchKey);

        if(this.searchBy==1){
            this.result1 = 'Search Result Sorted by Name';
        }
        else if(this.searchBy==2){
            this.result1 = 'Search Result Sorted by ISBN';
        }
        else if(this.searchBy==3){
            this.result1 = "Search Result Sorted by Author Name";
        }

        

        let validate = false;
        if(this.searchBy == undefined){
            alert('Please Select any one "Search By " Name| ISBN| Author');
        }
        else{
            validate = true;
        }
        if(validate){
            this.fatchingBooks();
        }
        //console.log('>> '+JSON.stringify(this.tableData));
    }

    limitHasChanged(event){
        this.limit = event.detail.value;
        console.log('New Limit is :: '+this.limit);
        this.pageSize = this.limit;
        console.log(this.searchKey);
        if(this.searchKey == undefined ||this.searchKey =='' ||  this.searchKey ==' '){
            this.connectedCallback();
        }else{
            this.fatchingBooks();
        }
        
    }
    moveToCmp3(event){
        let indexNo = event.currentTarget.dataset.index;
        console.log('Index Is :: '+indexNo);

        event.preventDefault();
        console.log('At 141');
        let componentDef = {
            componentDef: "c:libraryCmp3",
            attributes: {
                // name: this.item1[indexNo-1]['Name'],
                // freeBooks: this.item1[indexNo-1]['Number_of_Free_Books__c'],
                // issuedBooks:this.item1[indexNo-1]['Number_of_Issued_Books__c'],
                // totalBooks: this.item1[indexNo-1]['Number_of_Books__c'],
                isbn:this.item1[indexNo-1]['ISBN_Number__c'],
                bookId1:this.item1[indexNo-1]['Id']
            }
        };
        let encodedComponentDef = btoa(JSON.stringify(componentDef));
        console.log('At 154');
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes:{
                url: '/one/one.app#'+encodedComponentDef
            }            
        });

    }
    displayRecordPerPage(page){
        
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
    
        this.endingRecord = (this.endingRecord > this.totalRecordCount) 
                            ? this.totalRecordCount : this.endingRecord; 
    
        this.tableData = this.item1.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
        
    
    }
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    get disablePrev(){
        if(this.page===1){
    return true;
        }else{
        return false;
        }
    }
    get disableNext(){
        if(this.page===this.totalPage||this.totalPage===0){
        return true;
    
        }
        else{
        return false;
        }
    }
}