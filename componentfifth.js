import { LightningElement, api, wire, track } from 'lwc';


export default class componentfifth extends LightningElement {

    @track tabId = "tab1";
    @track name;
    @track isbn;

    @track bookId;
    @track showInfoTab = false;

    @track calledBy;

   
    handleIssueClick(event){
        console.log('Now call Cmp3');
        let book = event.detail;
        console.log(JSON.stringify(book));
        this.tabId = "tab3";
        this.name = book['Name'];
        this.isbn = book['ISBN_Number__c'];
        console.log(this.name);
        this.calledBy = 1;
        console.log('test is called');
        this.prefillDataInTab3();
        // this.template.querySelector('[data-id="Green_Button"]').click();
    }
    prefillDataInTab3(){
        console.log('filling');
        setTimeout(()=>{
            this.template.querySelector("c-componentForth").call(this.name,this.isbn); //for prefilling the book input
        },500);
    }
    selectedTab(event){
        this.tabId = event.target.value;
        console.log('Selected Tab => '+this.tabId);
    }

    openInfoTab(event){
        //alert('Now Do codes!');
        let data = event.detail;
        console.log(JSON.stringify(data));

        this.bookId = data;
        this.showInfoTab = true;
        this.tabId = "tab5";
    }
    moveToIssueTab(event){
        let data = event.detail;
        this.tabId = "tab3"

        this.name = data['Name'];
        this.isbn = data['ISBN_Number__c'];
        this.calledBy = 5;
        this.prefillDataInTab3();
    }
}