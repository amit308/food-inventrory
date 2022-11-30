import { Component, OnInit, Renderer2, ElementRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ProductsList } from '../services/productslist.service';
import { CartService } from '../services/cart.service';
import { SiteMetaService } from '../services/site-meta.service';
import {FormControl, FormGroup} from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OrdersService } from '../services/orders.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import * as moment from 'moment';

@Component({
  selector: 'app-choose-payment-method',
  templateUrl: './choose-payment-method.component.html',
  styleUrls: ['./choose-payment-method.component.css']
})
export class ChoosePaymentMethodComponent implements OnInit {
  productPopup: boolean = false;
  cartPopup: boolean = false;
  deliveryPopup: boolean = false;
  number: number = 0;
  number1: number = 0;
  number2: number = 0;
  loginStatus: boolean = false;
  categories: any;
  products: any;
  popupVariants: any;
  selectedVariant: any;
  cartItems: any;
  siteDetails: any;
  product: any;
  errMsg: any = false;
  paymentMode: any;
  payMode: any = 'Barzahlung';
  delOption: any = 'TodayOrder';
  advanceOrderDate: any = '';
  tipOption: any;
  deliveryOption: any;
  cartNote: any = localStorage.getItem('note');
  orderTimeTitle: any = (localStorage.getItem('deliveryType') == 'DELIVERY') ?
                        'Wählen Sie die Lieferzeit Ihrer Wahl' : 'Wählen Sie die Abholzeit Ihrer Wahl';
  orderTimes: any[] = [];

  minDate: any;
  maxDate: any;
  datesFilter: any;
  startAt: any;

  orderType: any = localStorage.getItem('deliveryType');
  orderTotal: any;
  currentDistance: any;
  selectedOrderTime: any;
  isTimeAcceptable: any = true;
  timeSlots: any[] = [];
  orderTime: any = null;
  isHoliday: boolean;
  holidayMessage: any;
  isLoading: boolean;

  public choose = "";
  setvalue(drp:any){
    this.choose=drp.target.value;
  }

  public payPalConfig ? : IPayPalConfig;

  @ViewChild('payPalBtns') payPal: ElementRef;

  constructor(private jwthelper: JwtHelperService, private router: Router, private elem: ElementRef,
    private renderer: Renderer2, private __homeMenu: ProductsList, public __siteMeta: SiteMetaService,
    public CartService: CartService, private orderService: OrdersService) {

    const userDetails = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails')) : null;
    this.cartItems = CartService.getCart();

   /* if(!this.cartItems && userDetails && !jwthelper.isTokenExpired(userDetails.token)) {
      router.navigate(['/']);
      return;
    }*/

    console.log('After Routing');

    this.paymentMode = new FormGroup({"mode": new FormControl('Barzahlung'),
                                      "orderTime": new FormControl('Sofort'),
                                      "advanceOrder": new FormControl('TodayOrder'),
                                      "tip": new FormControl('')});

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.__siteMeta.siteDetails().subscribe(data => {
      this.siteDetails = data.data;
      console.log(this.siteDetails);
      console.log("disc", data.data.discount);
      this.initPayPal();
      this.__siteMeta.updateDiscount(data.data.deliveryDiscount, data.data.collectionDiscount);
      this.orderTotal = this.CartService.cartTotalAmount.total;
      console.log('Total: ' + this.orderTotal);
      this.updateDeliverySettings();

      if(this.CartService.tip != 0) {
        this.paymentMode.patchValue({tip: this.CartService.tip});
      }

      this.initDeliveryTimes();
      this.initializeCalendar();
      this.isLoading = false;
    },
      error => {
        alert("Server Under Maintainance");
        return;
      });

    this.cartItems = this.CartService.getCart();
    console.log(this.cartItems);
    this.loginStatus = localStorage.getItem('userDetails') ? true : false;
    this.__homeMenu.productsList().subscribe(data => {
      // console.log(data);
      if (data.success == true) {
        this.categories = data.data;
      }
    },
      error => {
        console.log(error);
      });

  }

  initializeCalendar()
  {
    const minDate = moment().add(1, 'days');
    this.minDate = new Date(minDate.year(), minDate.month(), minDate.date());
    console.log(this.minDate);

    const maxDate = moment().add(7, 'days');
    this.maxDate = new Date(maxDate.year(), maxDate.month(), maxDate.date(), 23, 59);

    this.startAt = new Date(minDate.year(), minDate.month(), minDate.date(),
                            minDate.hours(), minDate.minutes(), minDate.seconds());
    console.log(this.startAt);

    // Get days list
    let days: any[] = [];

    this.siteDetails.timeSlots.forEach((slot: any) => {
      slot.days.forEach((day: any) => {
        days.push(day);
      });
    });

    days = Array.from(new Set(days));

    this.datesFilter = (d: Date | null): boolean => {
      let day = (d || new Date()).getDay();

      if(day == 0 && days.includes('Sunday')) {
        return day == 0;
      }
      else if(day == 1 && days.includes('Monday')) {
        return day == 1;
      }
      else if(day == 2 && days.includes('Tuesday')) {
        return day == 2;
      }
      else if(day == 3 && days.includes('Wednesday')) {
        return day == 3;
      }
      else if(day == 4 && days.includes('Thursday')) {
        return day == 4;
      }
      else if(day == 5 && days.includes('Friday')) {
        return day == 5;
      }
      else {
        return day == 6;
      }
    }
  }

  toggleCart() {
    if (this.cartPopup == false) {
      this.cartPopup = true;
    } else {
      this.cartPopup = false;
    }
  }

  productVariantsPopup(product: any) {
    console.log(product.options);
    this.popupVariants = product.options;
    this.product = product;
    this.productPopup = this.productPopup ? false : true;
    this.selectedVariant
    return;
  }

  decreaseValue(variable: any, i: number) {
    var quantity = parseInt(this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value);
    if (quantity == 1) return;
    this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value = (quantity - 1);
    this.CartService.updateQuantity(i, quantity - 1);
  }

  increaseValue(variable: any, index: number) {
    var quantity = parseInt(this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value);
    this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value = quantity + 1;
    this.CartService.updateQuantity(index, quantity + 1);
  }

  toggleVariantProduct() {
    this.productPopup = this.productPopup == true ? false : true;
    this.selectedVariant = false;
  }

  ifItemExists(itemId: any) {
    return this.CartService.cartItems.find((item: any) => item._id === itemId ? true : false);
  }

  selectProductVar(variant: any, product: any) {
    var selectedVariant = {
      _id: product._id,
      name: product.name,
      option: variant.name,
      price: variant.price,
      note: ""
    }
    return selectedVariant;
  }


  initPayPal()
  {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AahOn7kQbbShY3u7Mit7H_tqraz3yhBQgRDuOn7pYvesMnAzG_8kLBSWCZAHRRnsZgjxUcDJw9oMonN_',
      createOrderOnClient: () => <ICreateOrderRequest> {
          purchase_units: [{
              amount: {
                  currency_code: 'EUR',
                  value: this.orderTotal,
                  breakdown: {
                      item_total: {
                          currency_code: 'EUR',
                          value: this.orderTotal
                      }
                  }
              },
          }]
      },
      advanced: {
          commit: 'true'
      },
      style: {
          label: 'paypal',
          layout: 'vertical',
      },
      onApprove: (data, actions) => {
          console.log('onApprove - transaction was approved, but not authorized', data, actions);
          this.redirect();
          actions.order.get().then((details: any) => {
              console.log('onApprove - you can get full order details inside onApprove: ', details);
          });

      },
      onClientAuthorization: (data) => {
          console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
          //this.showSuccess = true;
      },
      onCancel: (data, actions) => {
          console.log('OnCancel', data, actions);
          //this.showCancel = true;

      },
      onError: err => {
          console.log('OnError', err);
          //this.showError = true;
      },
      onClick: (data, actions) => {
          console.log('onClick', data, actions);
          //this.resetStatus();
      },
  };
}

setPaymentMode()
{
  this.payMode = this.paymentMode.get('mode').value;
  console.log(this.payMode);
}

  redirect() {

    console.log(this.paymentMode.get('mode').value);

    this.CartService.proccessCart(this.paymentMode.get('mode').value, this.orderTime)
    .subscribe(data => {
      if (data.success == true) {
        console.log(data);
        localStorage.setItem('isOrderAdded', 'true');
        this.orderService.setOrderId(data.orderId);
        this.orderService.setOwnerId(data.ownerId);
        this.router.navigate(['order-process']);
      } else {
        this.errMsg = data.message;
      }
    },
      error => {
        this.errMsg = error.message;
        console.log(error);
      });
  }

  setDeliveryOption()
  {
    const ownInput = document.getElementById('owlInput') as HTMLInputElement;

    this.delOption = this.paymentMode.get('advanceOrder').value;
    this.delOption == 'TodayOrder' ? ownInput.value = '' : null
    this.isTimeAcceptable = true;
    this.isHoliday = false;
    this.orderTime = this.delOption == 'TodayOrder' ? this.paymentMode.get('orderTime').value : '';
  }

  setOrderTime()
  {
    this.orderTime = this.paymentMode.get('orderTime').value;
    console.log(this.orderTime);
  }

  setAdvanceOrderDateTime(event: any)
  {
    this.isTimeAcceptable = false;
    this.isHoliday = false;

    this.advanceOrderDate = moment(event.value).format("MMMM Do YYYY, hh:mm a");
    let calTime = moment(moment(this.advanceOrderDate.split(',')[1], 'hh:mm a').format('HH:mm'), 'HH:mm');
    let calDateDay = moment(this.advanceOrderDate.split(',')[0], "MMMM Do YYYY").format("dddd");

    console.log('Calendar Time ' + calTime);
    console.log('Calendar Day ' + calDateDay);

    for(let i = 0; i < this.siteDetails.timeSlots.length; i++ )
    {
      const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
      const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');
      const days = this.siteDetails.timeSlots[i].days;
      const holidayDates = this.siteDetails.timeSlots[i].holidayDates;

      if(calTime.isBetween(openTime, closeTime) && days.includes(calDateDay))
      {
        if(holidayDates.includes(moment(event.value).format('DD/MM/YYYY')))
        {
          this.isHoliday = true;
          this.holidayMessage = moment(event.value).format('DD/MM/YYYY') + ' is Holiday from timings ' +
                                openTime.format('HH:mm') + ' to ' + closeTime.format('HH:mm');
        }
        else {
          this.isTimeAcceptable = true;
        }

        break;
      }
    }

    this.advanceOrderDate = this.isTimeAcceptable ? this.advanceOrderDate : '';
    this.orderTime = (this.advanceOrderDate.length != 0) ? this.advanceOrderDate : '';

    console.log(this.advanceOrderDate);
  }

  setTipOption()
  {
    this.tipOption = this.paymentMode.get('tip').value;
    this.CartService.tip = this.tipOption == null ? 0 : this.tipOption;
    this.CartService.cartTotal();
    console.log(this.tipOption);
  }

  updateDeliverySettings()
  {
    this.currentDistance = localStorage.getItem('currentDistance') ? parseFloat(localStorage.getItem('currentDistance')) : 0
    for(let i = 0; i < this.siteDetails.distanceDetails.length; i++) {
      if(parseFloat(this.siteDetails.distanceDetails[i].minDistance) <= this.currentDistance
        && this.currentDistance < parseFloat(this.siteDetails.distanceDetails[i].maxDistance))
      {
        this.CartService.deliveryFee = parseFloat(this.siteDetails.distanceDetails[i].deliveryCharge);
        this.CartService.orderTime = (this.CartService.deliveryType == 'DELIVERY') ?
            parseInt(this.siteDetails.distanceDetails[i].deliveryTime) : parseInt(this.siteDetails.collectionTime);

        break;
      }
    }
  }

  initDeliveryTimes()
  {
    let currTime = moment(moment().format('HH:mm'), 'HH:mm');
    let addTimes = parseInt(this.CartService.orderTime);
    let dynTime;
    let currOpenTimeIndex = -1;

    // If restaurant is Online show normal timings
    if(this.siteDetails.isOnline)
    {
      this.orderTimes.push('Sofort');

      // Add Time Slots upto close time when current time is between open and close time
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');

          if(currTime.isBetween(openTime, closeTime))
          {
            dynTime = moment(moment().add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');

            while(dynTime.isBefore(closeTime) && dynTime.isBetween(openTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'))
              addTimes = 15;
              dynTime = moment(dynTime.add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');
            }

            currOpenTimeIndex = i;
            break;
          }
        }
      }

      // Add remaining slots
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(i != currOpenTimeIndex && this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');

          if(currTime.isBefore(openTime))
          {
            const openT = moment(openTime);
            dynTime = moment(openT.add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');

            while(dynTime.isBefore(closeTime) && dynTime.isBetween(openTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'));
              addTimes = 15;
              dynTime = moment(dynTime.add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');
            }
          }
        }
      }

      this.orderTimes = (this.orderTimes.length == 1) ? [] : this.orderTimes;
    }
    // If restaurant is closed show timings for another open times
    else
    {
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');

          if(currTime.isBefore(openTime))
          {
            const openT = moment(openTime);
            dynTime = moment(openT.add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');

            while(dynTime.isBefore(closeTime) && dynTime.isBetween(openTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'));
              addTimes = 15;
              dynTime = moment(dynTime.add(addTimes, 'minutes').format('HH:mm'), 'HH:mm');
            }
          }
        }
      }
    }

    this.orderTimes.length ? this.paymentMode.patchValue({orderTime: this.orderTimes[0]}) : null;
    this.orderTime = this.paymentMode.get('orderTime').value;

    if(this.orderTimes.length == 0) {
      console.log('advance order');
      this.orderTime = null;
      this.paymentMode.patchValue({advanceOrder: 'AdvanceOrder'});
    }

  }

}

