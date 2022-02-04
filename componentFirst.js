import { LightningElement, wire, track, api } from 'lwc';

import realTimeFetchBooks from '@salesforce/apex/Book.realTimeFetchBooks';
import createBookCopies from '@salesforce/apex/Book.createBookCopies';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class componentFirst extends LightningElement {

    @track tableData;
    @track tableDataToShow;//store real time data for search result
    @track error;
    @track mode = false;
  
    @track Book__c={
        'Name':null,
        'Author__c':null,
        'ISBN_Number__c':null,
        'Price__c':null,
        'ISBN_In_Text__c':null
    };
    @track bookCopyCount;

    getnewValues(event){
        let rowNo = event.currentTarget.dataset.no;
        console.log('... '+rowNo);

        if(rowNo == 1){
            this.Book__c.Name = event.detail.value;
        }
        else if(rowNo == 3){
            this.Book__c.Price__c = event.detail.value;
        }
        else if(rowNo == 4){
            this.Book__c.Author__c = event.detail.value;
        }
        else if(rowNo == 5){
            this.bookCopyCount = event.detail.value;
        }
    }

    searchISBN(event){
            
        if(event.detail.value !=null || event.detail.value != undefined){
            this.Book__c.ISBN_Number__c = event.detail.value;
            realTimeFetchBooks({isbn : event.detail.value})
            .then(result =>{
                this.tableDataToShow = result;
            })
            console.log(JSON.stringify(this.tableDataToShow));

        }
    }

    selectToDisplay(event){
        let index = event.currentTarget.dataset.index;
        
        this.Book__c.Name = this.tableDataToShow[index-1]['Name'];
        this.Book__c.ISBN_Number__c = this.tableDataToShow[index-1]['ISBN_Number__c'];
        this.Book__c.Price__c = this.tableDataToShow[index-1]['Price__c'];
        this.Book__c.Author__c = this.tableDataToShow[index-1]['Author__c'];
        this.Book__c.ISBN_In_Text__c = this.tableDataToShow[index-1]['Id'];
        console.log('$ID '+JSON.stringify(this.Book__c.ISBN_In_Text__c));
        this.mode = true;
    }

    clear(){
        this.Book__c.Name = "";
        this.Book__c.ISBN_Number__c = "";
        this.Book__c.Price__c = "";
        this.Book__c.Author__c = "";
        this.Book__c.ISBN_In_Text__c = "";
        this.bookCopyCount = 0;
        this.mode=false;
    }

    insertBooks(){
        console.log('Adding....');
        console.log('Count >> '+this.bookCopyCount);
        console.log('>> '+JSON.stringify(this.Book__c));

        let list = [];
        list.push(this.Book__c);
        let validate = false;
        loop1: for(var j in this.Book__c){
                if(this.Book__c.Name==null || this.Book__c.ISBN_Number__c==null || this.Book__c.Author__c ==null ||
                    this.Book__c.Name=="" || this.Book__c.ISBN_Number__c=="" || this.Book__c.Author__c =="" ||
                    this.Book__c.Name==" " || this.Book__c.ISBN_Number__c==" " || this.Book__c.Author__c ==" "){
                    alert('Values Required in Name, ISBN, and Author !');
                    break loop1;
                    
                }
                else{
                    validate = true;
                }
        }
        if(validate){
            createBookCopies({bookId :this.Book__c.ISBN_In_Text__c, num: this.bookCopyCount, bookList:list})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Books Added/Updated in Library',
                        variant: 'success',
                    }),
                );
                this.clear();
                realTimeFetchBooks({isbn : null})
                .then(result =>{
                this.tableDataToShow = result;
                })
                
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'ISBN Must Be Unique!',
                        variant: 'error',
                    }),
                );
                this.clear();
                realTimeFatchBooks({isbn : null})
                .then(result =>{
                this.tableDataToShow = result;
                })
            });
        }
    }
  
}