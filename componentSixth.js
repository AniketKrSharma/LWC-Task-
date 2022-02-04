import { LightningElement, track, wire } from 'lwc';
import returnIssuedBooks from '@salesforce/apex/Book.returnIssuedBooks';
import fetchIssuedRecords from '@salesforce/apex/Book.fetchIssuedRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import fetchReaders from '@salesforce/apex/Book.fetchReaders';


export default class componentSixth extends LightningElement {

    @track tableData = [];
    holdValueForRefresh;

    @track loaded=true;
    
    @track showChild = false;
    @track varChild = 1;
    @track showChildArrow = "utility:down";

    @wire(fetchReaders)
    refreshActivity (value) {
        this.holdValueForRefresh = value;

        const { data, error } = value;
        this.tableData =[];
        if(data){
            console.log('>>> '+JSON.stringify(data));
            for(var i in data){
                console.log('>>');
                var reader = {
                    'Id':null,
                    'Name':null,
                    'Issued_Book':null,
                    'Returned':null,
                    'Over_due':null,
                    'Fine':null,
                    'Copy_name':{}
                }
                reader.Name = data[i]['Name'];
                reader.Id = i;
                let issued = 0;
                let returned = 0;
                let due = 0;
                let fine = 0;
                reader.Copy_name = data[i].Issue_Books__r;
                for(var j in data[i].Issue_Books__r){
                    console.log(data[i].Issue_Books__r[j].Is_Returned__c);
                    console.log(data[i].Issue_Books__r[j].Fine__c);
                    if(data[i].Issue_Books__r[j].Is_Returned__c){
                        returned +=1;
                    }
                    else if(data[i].Issue_Books__r[j].Is_Returned__c == false){
                        due +=1;
                    }
                    fine += data[i].Issue_Books__r[j].Fine__c;
                }
                issued = returned + due;
                reader.Issued_Book = issued;
                reader.Returned = returned;
                reader.Over_due = due;
                reader.Fine ='$ '+ Math.round(fine * 100) / 100;
                
                this.tableData.push(reader);
                console.log(">> "+JSON.stringify(reader));
                console.log('>> : '+JSON.stringify(this.tableData));
            }
        }
    }


    @track tableData;
    @track tableDataTmp;
    @track error1;
    refreshData;
    @track pageSize = 10;
    @track page = 1;
    @track totalRecordCount;
    @track totalPage;
    @track item1;
    @track endingRecord;
    @track startingRecord =1;
    
    @wire(fetchIssuedRecords)
    
    refreshActivity (value) {
        this.holdValueForRefresh = value;

        const { data, error } = value;
        this.tableData =[];
        if(data){
            console.log('>>> '+JSON.stringify(data));
            for(var i in data){
                console.log('>>');
                var reader = {
                    'Id':null,
                    'Name':null,
                    'Reader_Name':null,
                    'From':null,
                    'To':null,
                    'Return':null,
                    'Fine':null,
                    'Copy_name':{}
                }
                reader.Name = data[i]['Name'];
                reader.Id = i;
                let issued = 0;
                let returned = 0;
                let due = 0;
                let fine = 0;
                reader.Copy_name = data[i].Issue_Books__r;
                for(var j in data[i].Issue_Books__r){
                    console.log(data[i].Issue_Books__r[j].Is_Returned__c);
                    console.log(data[i].Issue_Books__r[j].Fine__c);
                    if(data[i].Issue_Books__r[j].Is_Returned__c){
                        returned +=1;
                    }
                    else if(data[i].Issue_Books__r[j].Is_Returned__c == false){
                        due +=1;
                    }
                    fine += data[i].Issue_Books__r[j].Fine__c;
                }
                issued = returned + due;
                reader.Issued_Book = issued;
                reader.Returned = returned;
                reader.Over_due = due;
                reader.Fine ='$ '+ Math.round(fine * 100) / 100;
                
                this.tableData.push(reader);
                console.log(">> "+JSON.stringify(reader));
                console.log('>> : '+JSON.stringify(this.tableData));
            }
        }
    }

    
    forRefreshApex(value){
        this.refreshData = value;
        const { data, error } = value;
        if(data){
            this.tableDataTmp = data
            this.tableData = data.map( item =>{
                let a = this.getDiff(item['From__c'],item['To__c']);
                let b = this.getDiff(item['From__c'],null);
                let daysLeft = (a-b);
                let color = item['Return_Date__c'] ==null ? 
                                daysLeft<0 ?"slds-hint-parent pass": 
                                daysLeft>=0 && daysLeft<=2 ? "slds-hint-parent days-left" :"slds-hint-parent"
                                :"slds-hint-parent";
                let fine = color=="slds-hint-parent pass"? daysLeft<0 ?"fine-color2":"":daysLeft<0 ?"fine-color":"";
                return{...item,'Index__c':color, 'Fine__c':'$ '+item['Fine__c'], 'Fine_Color__c':fine}
            })
           
            this.totalRecordCount = this.tableData.length;
            this.totalPage = Math.ceil(this.totalRecordCount / this.pageSize);
            this.tableDataTmp = this.tableData.slice(0,this.pageSize);
            if(this.pageSize > this.totalRecordCount){
                this.endingRecord = this.totalRecordCount;
            }else{
                this.endingRecord = this.pageSize;
            }
        }
        else if(error){
            this.error1 = error;
        }
    }

    gettoday(){
        let rightNow = new Date();
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );
        
        let yyyyMmDd = rightNow.toISOString().slice(0,10);
        console.log(yyyyMmDd);
        return yyyyMmDd;
    }
    getDiff(from,to){
        var date1, date2;
        if(to==null){
            let today = this.gettoday();
            date2 = new Date(today);
        }
        else{
            date2 = new Date(to);
        }
        var date1 = new Date(from);
        var timeDiffrence = Math.abs(date1.getTime() - date2.getTime());
        var differDays = Math.ceil(timeDiffrence / (1000 * 3600 * 24)); 
        console.log(differDays);
        return differDays;
    }
    showAlert(event){

        alert('| '+event.currentTarget.dataset.copyName+' is already Returned with a Fine of "'+ event.currentTarget.dataset.fine+'" |');
    }
   
    displayRecordPerPage(page){
        
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
    
        this.endingRecord = (this.endingRecord > this.totalRecordCount) 
                            ? this.totalRecordCount : this.endingRecord; 
    
        this.tableDataTmp = this.tableData.slice(this.startingRecord, this.endingRecord);
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
    
    moveToInfo(event){
        let issueId = event.currentTarget.dataset.issueIds;
        let copyId = event.currentTarget.dataset.copyIds;
        let name = event.currentTarget.dataset.copyName;

        console.log(issueId+' '+copyId);
        let sendToParent = event.currentTarget.dataset.ids;
        //alert(sendToParent);
        let msg;
        returnIssuedBooks({ issueId: issueId, bookCopyId: copyId, num: 1})
        .then(() =>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: name+' Returned Successfully.',
                    variant: 'success',
                }),
            );
            const selectEvent12 = new CustomEvent('open3', {
                detail: sendToParent
            });
            refreshApex(this.refreshData);
            this.dispatchEvent(selectEvent12);            
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Try Again !',
                    variant: 'error',
                }),
            );
            const selectEvent12 = new CustomEvent('open3', {
                detail: sendToParent
            });
            refreshApex(this.refreshData);
            this.dispatchEvent(selectEvent12); 
        })
        
    }

    @track toolTip=false;
    @track toolTipText;
    @track toolTipPosition;

    showToolTip(event){
        let got = event.currentTarget.dataset.test;
        this.toolTipText = got;
        
        this.toolTip = true;
        this.toolTipPosition =  "position:absolute;top:"+event.clientY+"px;left:"+event.clientX+"px";
        
    }
    hideToolTip(){
        this.toolTip = false;
    }
}