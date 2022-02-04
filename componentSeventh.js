import { LightningElement, track, wire } from 'lwc';

import fetchReaders from '@salesforce/apex/Book.fetchReaders';

import {refreshApex} from '@salesforce/apex';

export default class componentSeventh extends LightningElement {

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
}