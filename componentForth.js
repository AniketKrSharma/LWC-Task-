import { api, LightningElement, track } from 'lwc';
import issueBooks from '@salesforce/apex/Book.issueBooks';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex'

export default class componentForth extends LightningElement {
    @track bookId;
    @track bookPrice;
    @track bookCount;
    @track readerId;
    @track charges = '$ '+0.00;
    @track dateOfReturn;
    @track dateOfIssue;
    @track mode=false;
    @track name;
    @track readerName;

    @track mode2 = false;
    @track dateCssClass = "";

    getBookId(event){
        console.log('Book ::>'+JSON.stringify(event.detail));
        let book = event.detail;
        this.bookId = book['Id'];
        this.bookPrice = book['Price__c'];
        this.bookCount = book['Number_of_Free_Books__c'];
        this.name = book['Name'];
        if(this.bookCount <= 0){
            this.mode = true;
            alert(this.name +" Doesn't have enough copies to issue !");
        }
        else{
            this.mode = false;
        }
        this.dateOfReturn = null;
        this.charges = '$ '+0.00;
    }
    getReaderId(event){
        console.log('Reader ::>'+JSON.stringify(event.detail));
        let reader = event.detail;
        this.readerId = reader['Id'];
        this.readerName = reader['Name'];
    }
    getIssueDate(){
        let rightNow = new Date();

        // Adjust for the user's time zone
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );
        // Return the date in "YYYY-MM-DD" format
        let yyyyMmDd = rightNow.toISOString().slice(0,10);
        console.log(yyyyMmDd);
        this.dateOfIssue = yyyyMmDd;
    }
    selectDateofReturn(event){
        this.dateOfReturn=event.target.value;;
        var dateOfReturn1 = new Date(event.target.value);
        console.log(this.dateOfReturn);
        this.getIssueDate();
        var date1 = new Date(this.dateOfIssue);//mm/dd/yyyy
        var date2 = new Date(dateOfReturn1);//mm/dd/yyyy
        //console.log(date1+' '+date2);
        ;
        if(this.checkDate(date1,event.target.value)){
            this.mode2 = true;
            this.dateCssClass = 'slds-has-error';
            this.charges = '$ '+0.00;
        }
        else{
            this.mode2 = false;
            this.dateCssClass ='';
            console.log('>>' +this.dateOfReturn)
            var timeDiffrence = Math.abs(date2.getTime() - date1.getTime());
            var differDays = Math.ceil(timeDiffrence / (1000 * 3600 * 24)); 
            this.charges = '$ '+(this.bookPrice * (differDays) * 0.0025);
            console.log(" Charges for "+differDays +" days is :: "+this.charges);
        }
    }

    issueBook(){
        let validate;
        if(this.readerName == null || this.readerName ==undefined || this.readerName == '' || this.readerName==' ' ||
            this.name == null || this.name == undefined || this.name == '' || this.name ==' '){
                validate = false;
                alert('Please Select Book/Reader from the List !')
            }
        else if(this.dateOfReturn == null || this.dateOfReturn == undefined){
            validate = false;
            alert('Please select a valid date in Tentative Date of Return');
        }
        else{
            validate = true;
        }
        if(validate){
            issueBooks({readerId: this.readerId,bookId: this.bookId,returnDate: this.dateOfReturn})
            .then(()=>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: this.name+' Issued to '+this.readerName,
                        variant: 'success',
                    }),
                );
                this.reset();
                this.msgParent();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Unabled to Issue',
                        variant: 'error',
                    }),
                );
                this.reset();
            })
        }

    }
    reset(){
        let number = 1;
        this.template.querySelectorAll("c-search-record-result")
        .forEach(element =>{
            console.log('1++');
            element.listenParent(number);
            number++;
            console.log('2++');
        });

        this.charges = '$ '+0.00;
        this.dateOfReturn='';
        this.dateOfIssue='';
        this.bookPrice='';
        this.bookId='';
        this.readerId='';
        this.mode = false;
        this.readerName='';
        this.name='';
        this.mode2 = false;
        this.dateCssClass ='';
        console.log('Finished');
    }

    @api
    call(bookName,isbn){
        console.log('CMP4 =>'+bookName);
        this.template.querySelector("c-search-record-result").listenSuperParent(bookName,isbn);
    }

    msgParent(){
        //dispatch event
        this.mode2 = false;
        this.dateCssClass ='';
        const selectEvent = new CustomEvent('move', {
            detail:'move'
        });
        this.reset();
        this.dispatchEvent(selectEvent);
    }

    checkDate(date1,date2){
        
        var dd = date1.getDate();
        var mm = date1.getMonth() + 1;
        var yyyy = date1.getFullYear();

        if(dd < 10 ){
            dd = '0'+ dd;
        }
        if(mm < 10){
            mm = '0'+ mm;
        }
        var format = yyyy+'-'+mm+'-'+dd;
        if(date2 < format){
            return true;
        }
        else{
            return false;
        }
    }
}