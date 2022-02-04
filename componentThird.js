import { LightningElement, api, track} from 'lwc';
import fetchIssueBookDetails from '@salesforce/apex/Book.fetchIssueBookDetails';

export default class componentThird extends LightningElement {
    value2 = '';
    @track name; 
    @track freeBooks;
    @track issuedBooks;
    @track totalBooks;
    @api isbn;
    @track mode1 = false;
    @track cmp1 =false; 
    @track freeBooksTrack;
    @track tableData;
    
    
    connectedCallback(){
        fetchIssueBookDetails({ bookId : this.bookId1 })
            .then(result => {
                this.tableData = result;
                
                if(Object.keys(this.tableData).length != 0){
                    console.log('>> '+JSON.stringify(this.tableData));
                    this.name =  this.tableData[0]['Book__r']['Name'];
                    this.freeBooks = this.tableData[0]['Book__r']['Number_of_Free_Books__c'];
                    this.totalBooks = this.tableData[0]['Book__r']['Number_of_Books__c'];
                    if(this.freeBooks == 0 || this.freeBooks == undefined){
                        this.mode1 = true;
                    }
                    else{
                        this.mode1 = false;
                    }                    
                }                
            })       
    }
}