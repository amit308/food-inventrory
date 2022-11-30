import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormControlName } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-address-confirm',
  templateUrl: './address-confirm.component.html',
  styleUrls: ['./address-confirm.component.css']
})
export class AddressConfirmComponent implements OnInit {
  @Input() firstName!: string;
  lastName: any;
  address: any;
  city: any;
  postcode: any;
  houseNumber:  any;
  street: any;
  phoneNo: any;
  postal: any
  addressConfirm: any;
  userDetails: any = JSON.parse(localStorage.getItem('userDetails'));
  deliveryType: any = localStorage.getItem('deliveryType');
  disableHouseNo: boolean;
  disableStreet: boolean;
  disableCity: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    console.log(JSON.parse(localStorage.getItem('userDetails')));

    this.firstName = JSON.parse(localStorage.getItem('userDetails')).firstName;
    this.lastName = JSON.parse(localStorage.getItem('userDetails')).lastName;
    this.address = JSON.parse(localStorage.getItem('userDetails')).address;
    this.houseNumber = localStorage.getItem('houseNo') ? localStorage.getItem('houseNo') : null //JSON.parse(localStorage.getItem('userDetails')).houseNumber;
    this.street = localStorage.getItem('street') ? localStorage.getItem('street') : null;
    this.city = localStorage.getItem('city') ? localStorage.getItem('city') : null;
    this.phoneNo = JSON.parse(localStorage.getItem('userDetails')).contact;
    this.postal = localStorage.getItem('postal') ? localStorage.getItem('postal') : null;
    this.postcode = localStorage.getItem('postcode');

    if(this.houseNumber) {
      this.disableHouseNo = true;
    }
    if(this.street) {
      this.disableStreet = true;
    }
    if(this.city) {
      this.disableCity = true;
    }

    if(this.postal) {
      this.city = this.postal + ' ' + this.city;
    }

    this.addressConfirm = new FormGroup({
      "firstName": new FormControl({value: this.firstName, disabled: true},[Validators.required]),
      "lastName": new FormControl({value: this.lastName, disabled: true}, [Validators.required]),
      "houseNumber": new FormControl({value: this.houseNumber, disabled: this.disableHouseNo}, [Validators.required]),
      "street": new FormControl({value: this.street, disabled: this.street}, [Validators.required]),
      "city": new FormControl({value: this.city, disabled: this.disableCity},[Validators.required]),
      "address1": new FormControl({value: this.postcode, disabled: true},[Validators.required]),
      "phoneNo": new FormControl(this.phoneNo,[Validators.required, /* Validators.min(1000000000), Validators.max(9999999999) */]),
      "postcode": new FormControl({value: this.postcode, disabled: true}),
      "note": new FormControl('')
    });
  }

  ngOnInit(): void {
  }

  paymentMethod(addressDetails: any)
  {
    console.log('payment method');
    console.log(addressDetails);

    if(this.deliveryType=='DELIVERY') {
      /* this.userDetails.address = addressDetails.street + ' ' + addressDetails.houseNumber + ', ' + addressDetails.city; */
      this.userDetails.address = this.addressConfirm.get('street').value + ' '
                                + this.addressConfirm.get('houseNumber').value + ', '
                                + this.addressConfirm.get('city').value;

      this.userDetails.contact = addressDetails.phoneNo;
      this.userDetails.postcode = this.postcode;
    }
    else {
      this.userDetails.contact = addressDetails.phoneNo;
    }

    localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
    localStorage.setItem('note', addressDetails.note);

    this.router.navigate(['payment-method']);
  }

  logOut()
  {
      localStorage.removeItem('userDetails');
      localStorage.getItem('isPaymentClicked') ? null : localStorage.setItem('isPaymentClicked', 'false');
      localStorage.getItem('deliveryType') ? null : localStorage.setItem('deliveryType', 'PICKUP')
      localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;
      location.replace('/login');
  }

}
