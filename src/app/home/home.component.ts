import { HostListener, Component, ViewChild, OnDestroy, OnInit,
  Renderer2, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { ProductsList } from '../services/productslist.service';
import { CartService } from '../services/cart.service';
import { SiteMetaService } from '../services/site-meta.service';
import { PasscodeService } from '../services/passcode.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { SocketioService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';
import { LogoService } from '../services/logo.service';
import { SwiperComponent } from 'swiper/angular';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProductInfoDialogComponent } from '../product-info-dialog/product-info-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  env: any = environment;
  productPopup: boolean = false;
  cartPopup: boolean = false;
  deliveryPopup: boolean = false;
  number: number = 0;
  number1: number = 0;
  number2: number = 0;
  loginStatus: boolean = false;
  categories: any;
  originalCategories: any;
  products: any;
  popupVariants: any;
  selectedVariant: any;
  selectedSubVariant: any;
  selectedOption: any;
  selectedOptionTopping: any;
  selectedVariantOption: any;
  isVariantSelected: boolean;
  isSubVariantSelected: boolean;
  isOptionSelected: boolean;
  cartItems: any;
  siteDetails: any;
  product: any;
  toppingCount: number[] = [];
  activeCategory: any = 0;
  isLoading: boolean = true;
  passCodeValidMsg: any = false;
  passcode: boolean = false;
  deliveryType: any;
  userDetails: any;
  profileDropdown: boolean = false;
  isPaymentClicked: boolean = false;
  sticky: number;
  stickyNav: any;
  stickyNavHeight: any;
  stickyMenuItems: any[] = [];
  menuItems: any[] = [];
  webMenuCont: any;
  //cats: any;
  isSticky: boolean = false;
  prevActiveMenuItem: any;
  isGoogleAPIfetching: boolean;
  maxDeliveryDistance: any;
  currentDistance: any;

  catsItems: boolean[] = [];
  scrollWait: any;

  CoverImage: any;
  IconImage: any;

  isMobileView: boolean;
  isItemsInit: boolean = true;
  isItemChanged: boolean;
  currScrollPos: number = 0;
  selectedItem: any;
  addressOptions: any = {
    types: [],
    componentRestrictions: {country: 'DE'}
  }
  isAddressValid: boolean = true;
  noteForm: any;
  searchPlaceholders: any[] = ["Burger", "Shake", "Fries", "Shawarma", "Burrito", "Shrimp", "Taco", "Pancake", "Pizza", "Bacon"];
  showHolder: any = "Suche";
  searchPlaceholderTimeout: any;
  productInfo: any;
  selectedDelAddress: any;


  @ViewChild('Swiper') swiper: SwiperComponent;
  @ViewChild('categoriesCont') cats: any;
  @ViewChildren('menuItemsCont') menuItemsCont: QueryList<any>;
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  //@ViewChildren('swiperItems') stickyMenuItemsCont: QueryList<any>;

  constructor(private router: Router, private elem: ElementRef,
    private renderer: Renderer2, private __homeMenu: ProductsList,
    public __siteMeta: SiteMetaService, public CartService: CartService, public logoService: LogoService,
    private __passcodeService: PasscodeService, private socketService: SocketioService, private http: HttpClient,
    public dialog: MatDialog) {

      this.noteForm = new FormGroup({"item-note": new FormControl(null)});
      if(window.innerWidth<801){
        this.isMobileView = true;
      }

     //this.socketService.setupSocketConnection();
     this.socketService.joinRoom();
 }

  @HostListener('click', ['$event.target'])
  onClick(btn: any) {
    if (this.deliveryPopup || this.cartPopup || this.productPopup) {
      this.renderer.addClass(document.body, 'modal-open');
    } else {
      this.renderer.removeClass(document.body, 'modal-open');
    }
  }

  listenSockets() {

    this.socketService.on('onImageChange').subscribe(data => {
      let response = data[0];

      if(response.imageType === 'COVER') {
        this.CoverImage = response.imageData;
      }
      else if(response.imageType === 'ICON') {
        this.IconImage = response.imageData;
        this.logoService.setLogo(response.imageData);
      }

    })

    this.socketService.on('refreshHome')
    .subscribe(data =>{
      this.isItemChanged = true;

      this.categories = data[0];
      this.originalCategories = Array.from(this.categories);
      this.CartService.categories = this.categories;
      this.CartService.updateItemCounter();

      if(window.innerWidth < 801) {
        window.scrollTo(0, this.currScrollPos - 1);
      }
    })

    this.socketService.on('refreshProfile')
    .subscribe(data =>{
      this.siteDetails = data[0];
      this.maxDeliveryDistance = this.siteDetails.deliveryRadius;

      let time = this.siteDetails.openTime.split(':');
      this.siteDetails.openTime = time[0] + ':' + time[1];
      time = this.siteDetails.closeTime.split(':');
      this.siteDetails.closeTime = time[0] + ':' + time[1];
      this.__siteMeta.updateDiscount(data[0].deliveryDiscount, data[0].collectionDiscount);
      if(!localStorage.getItem('userDetails')) {
        localStorage.removeItem('cartItems');
        this.CartService.cartItems = [];
      }
      this.CartService.cartTotal();
      this.updateDeliverySettings();

    })
  }

  ngAfterViewInit()
  {
    this.menuItemsCont.changes.subscribe((data) => {

      this.menuItems = Array.from(data);
      this.getStickyElement();
    });

  }

  ngOnDestroy(): void {
    this.socketService.leaveRoom();
    this.socketService.removeAllListeners();
  }

  ngOnInit(): void {

    this.deliveryPopup = true;
    this.loginStatus = localStorage.getItem('userDetails') ? true : false;
    this.userDetails = JSON.parse(localStorage.getItem('userDetails'));

    if(!localStorage.getItem('cartItems')) {
      this.CartService.tip = 0;
     }

    this.listenSockets();

    console.log(this.CartService.deliveryType);
    //Get Cover Image
    this.http.get(this.env.apiBaseUrl + this.env.cover + '&id=' + this.env.restaurant).subscribe((response: any) => {
        this.CoverImage = response.imageData;

      }, (err) => {
        console.log(err);
      });

    //Get Logo Image
    this.http.get(this.env.apiBaseUrl + this.env.logo + '&id=' + this.env.restaurant).subscribe((response: any) => {
        this.IconImage = response.imageData;
        this.logoService.setLogo(response.imageData);

      }, (err) => {
        console.log(err);
      });

      // Get Restaurant Details
    this.__siteMeta.siteDetails().subscribe(data => {
      this.siteDetails = data.data;
      console.log(this.siteDetails);
      this.maxDeliveryDistance = this.siteDetails.deliveryRadius;

      let time = this.siteDetails.openTime.split(':');
      this.siteDetails.openTime = time[0] + ':' + time[1];
      time = this.siteDetails.closeTime.split(':');
      this.siteDetails.closeTime = time[0] + ':' + time[1];

      this.isLoading = false;
      this.__siteMeta.updateDiscount(data.data.deliveryDiscount, data.data.collectionDiscount);
      if(!localStorage.getItem('userDetails')) {

        localStorage.removeItem('cartItems');
        localStorage.removeItem('currentDistance');
          this.CartService.cartItems = [];
          this.CartService.deliveryType = 'PICKUP';
          localStorage.setItem('deliveryType', 'PICKUP');
      }
      else {
        this.CartService.getCart();
      }

      let delType = localStorage.getItem('deliveryType');
      delType ? localStorage.setItem('deliveryType', delType) : localStorage.setItem('deliveryType', 'PICKUP');
      this.selectedDelAddress = localStorage.getItem('postcode') ? localStorage.getItem('postcode') : '';
      this.CartService.cartTotal();
      this.updateDeliverySettings();

    },
      error => {
        alert("Server Under Maintainance");
        return;
      });

      // Get Restaurant Menus
    this.__homeMenu.productsList().subscribe(data => {
      if (data.success == true) {
        this.categories = data.data;
        this.originalCategories = Array.from(this.categories);

        this.categories.forEach((cat: any)=> {
          cat.items.forEach((item: any)=>{
            item['itemCount']=0;
          })
        });

        this.CartService.getCart();
        this.CartService.categories = this.categories;
        this.CartService.updateItemCounter();

        console.log(this.categories);
        console.log(this.categories[0].items);

      }
    },
      error => {
        console.log(error);
      });
  }

  getStickyElement()
  {
    //this.cats = document.getElementById('categories');
    //console.log(this.cats);

    if(!this.isItemChanged) {
      this.sticky = this.cats.nativeElement.offsetTop;
    }
    //console.log(this.sticky);

    if(window.innerWidth < 801) {
      this.swiper.updateSwiper({});
    }

    //this.menuItems = Array.from(document.getElementsByClassName('stickyScroll'));
    //console.log(this.menuItems[0].offsetTop);

    /*this.stickyMenuItems = this.isMobileView ? Array.from(document.getElementsByClassName("swiper-items")) :
                                               Array.from(document.getElementsByName("stickyMenuItems"));*/

  //console.log(this.stickyNav);
  //console.log(this.stickyMenuItems);
  //console.log(this.menuItems);

  }

  toggleCart() {
    if (this.cartPopup == false) {
      this.cartPopup = true;
    } else {
      this.cartPopup = false;
    }
  }

  isPayment() {
    //(this.CartService.cartTotalAmount.subTotal < siteDetails.minimumOrder) ? "#" : (loginStatus == true ? "/address-confirmation" : "/register")
    localStorage.setItem('isPaymentClicked', "true");
    localStorage.removeItem('selectedItem');
    document.body.classList.remove('modal-open');
    console.log("clicked for login after payment");
  }

  //For Web & Mobile Scroll
  @HostListener('window:scroll', [])
  onWindowScroll()
  {
    this.currScrollPos = window.scrollY;
    if (window.pageYOffset >= this.sticky)
    {
      if(this.isMobileView) {
        this.cats.nativeElement.classList.add('sticky-mob');
      }

      const currentPos = this.isMobileView ? (window.scrollY - this.sticky + 25) : (window.scrollY - this.sticky + 70);

      for (const i in this.menuItems)
      {
        const top = this.menuItems[i].nativeElement.offsetTop;
        const bottom = this.menuItems[i].nativeElement.offsetTop + this.menuItems[i].nativeElement.offsetHeight;
        /*
        console.log('top ' + top);
        console.log('bottom ' + bottom);
        console.log('Curr ' + currentPos);*/

        if (currentPos >= top && currentPos <= bottom)
        {
          this.activeCategory = i;
          this.isMobileView ? this.swiper.setIndex(parseInt(i)) : '';

          /*
          for (const index in this.stickyMenuItems) {
            this.stickyMenuItems[index].classList.remove('active');
          }

          this.currCategoryIndex = parseInt(i);
          this.stickyMenuItems[i].classList.add('active');*/
        }
      }
    }
    else if(this.isMobileView) {
      this.cats.nativeElement.classList.remove('sticky-mob');
    }

  }

  scroll(el: any, elIndex: any) {
    document.getElementById(el).scrollIntoView();

      /*
      this.swiper.setIndex(parseInt(elIndex));

      for(const i in this.stickyMenuItems) {
        this.stickyMenuItems[i].classList.remove('active');
      }
      this.stickyMenuItems[elIndex].classList.add('active');
    }*/

  }

  refreshProduts(product: any) {
    this.CartService.cartItems.forEach((item: any) => {
      var el = document.getElementById(product._id) as HTMLInputElement;
      if (item._id != product._id) {
        el.checked = false;
      } else if (item._id == product._id) {
        el.checked = true;
      }
    });
  }

  productVariantsPopup(product: any, hasOption: boolean) {
    //console.log(product);
    this.productPopup = this.productPopup ? false : true;
    this.selectedOption = hasOption ? null : this.selectedOption;
    this.selectedOptionTopping = null;
    this.selectedVariant = null;
    this.selectedSubVariant = null;
    this.isVariantSelected = false;
    this.isSubVariantSelected = false;
    this.isOptionSelected = false;
    if(this.selectedItem) {
      this.selectedItem.toppings = [];
    }
    this.toppingCount.length = 0;

    var el = document.getElementById(product._id) as HTMLInputElement;
    if (this.CartService.cartItems.length == 0) {
      el.checked = false;
    }

    if(this.CartService.cartItems.some((item: any) => item._id == product._id)) {
      el.checked = true;
    }
    else {
      el.checked = false;
    }

    /*this.CartService.cartItems.forEach((item: any) => {
      if (item._id != product._id) {
        el.checked = false;
        console.log('For if');
      } else if (item._id == product._id) {
        el.checked = true;
        console.log('For else');
      }
    });*/

    if (!this.productPopup) return;
    this.popupVariants = product.options;
    this.product = product;

    /* for(let i = 0; i < this.product.toppings.length; i++) {
      this.toppingCount.push(0);
    } */

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
    this.selectedOption = false;
    this.toppingCount.length = 0;
  }

  ifItemExists(itemId: any) {
    return this.CartService.cartItems.find((item: any) => item._id === itemId ? true : false);
  }

  // Function for setting Options
  selectProductOption(product: any, option: any = []) {
    let selectedOption = {};
    this.isOptionSelected = true;
    this.selectedVariantOption = option;
    if(product.variants.length) {
      this.selectedVariant = product.variants;
    }
    else {
      this.selectedOptionTopping = option.toppings;
    }

    const initializeToppings = (this.selectedItem) ? this.selectedItem.toppings : [];

    if (option.length == 0)
    {
      selectedOption = {
        _id: product._id,
        name: product.name,
        option: '',
        price: product.price,
        note: "",
        toppings: initializeToppings,
        discount: product.discount? product.discount : 0,
        catDiscount: product.category.discount? product.category.discount : 0,
        overallDiscount: localStorage.getItem('deliveryType') == 'PICKUP' ? this.__siteMeta.collectionDiscount : this.__siteMeta.deliveryDiscount,
        excludeDiscount: product.excludeDiscount
      }
      this.toppingCount.length = 0;
      
    }
    else
    {
      selectedOption = {
        _id: product._id,
        name: product.name,
        option: option.name,
        price: option.price,
        note: "",
        toppings: initializeToppings,
        discount: product.discount? product.discount : 0,
        catDiscount: product.category.discount? product.category.discount : 0,
        overallDiscount: localStorage.getItem('deliveryType') == 'PICKUP' ? this.__siteMeta.collectionDiscount : this.__siteMeta.deliveryDiscount,
        excludeDiscount: product.excludeDiscount
      }
    }

    this.selectedItem = JSON.parse(JSON.stringify(selectedOption));
    localStorage.setItem('selectedItem', JSON.stringify(selectedOption));
    //console.log(this.selectedItem);

    if(this.selectedOptionTopping) 
    {
      this.toppingCount.length = 0;
      for(let i = 0; i < this.selectedOptionTopping.length; i++) {
          this.toppingCount.push(0);
      }
    }

    return selectedOption;
  }

  // Function for Setting Variants
  selectVariant(variant: any = []){
    console.log(variant);
    this.isVariantSelected = true;
    console.log(this.selectedVariantOption);
    

    if (variant.subVariants?.length == 0){
      this.selectedItem.subVariant = '';
      this.selectedItem.subVariantPrice = this.selectedItem.variantPrice;
      this.selectedOptionTopping = this.selectedVariantOption.toppings;
      const initializeToppings = (this.selectedItem) ? this.selectedItem.toppings : [];
    }
    else{
      this.selectedSubVariant = variant.subVariants;
    }

    if (variant.length == 0)
    {
       
      this.selectedItem.variant = '';
      this.selectedItem.variantPrice = this.selectedItem.option.price;
      
      this.toppingCount.length = 0;
    }

    else
    {
      this.selectedItem.variant = variant.name;
      this.selectedItem.variantPrice = variant.price;
    }

    this.selectedItem = JSON.parse(JSON.stringify(this.selectedItem));
    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));

    if(variant.subVariants.length == 0) 
    {
      this.toppingCount.length = 0;
      for(let i = 0; i < this.selectedOptionTopping.length; i++) {
          this.toppingCount.push(0);
      }
    }

    return this.selectedItem;
    
  }

  // Function for Setting subVariants
  selectSubVariants(subVariant: any = []){
    this.isSubVariantSelected = true;
    if(subVariant){
      this.selectedOptionTopping = this.selectedVariantOption.toppings;
      const initializeToppings = (this.selectedItem) ? this.selectedItem.toppings : [];
      } 

    if (subVariant.length == 0){
      this.selectedItem.subVariant = '';
      this.selectedItem.subVariantPrice = this.selectedItem.variantPrice;
    }
    else{
      this.selectedItem.subVariant = subVariant.name;
      this.selectedItem.subVariantPrice = subVariant.price;
    }

    this.selectedItem = JSON.parse(JSON.stringify(this.selectedItem));
    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));

    
      this.toppingCount.length = 0;
      for(let i = 0; i < this.selectedOptionTopping.length; i++) {
          this.toppingCount.push(0);
      
    }

    return this.selectedItem;
  }

  toppingsTotal(item: any){
    var toppingTotal = 0;
    item.toppings.forEach((topping: any) => toppingTotal += (parseFloat(topping.price) * parseFloat(topping.toppingCount)));
    return toppingTotal;
  }

  variantTotal(item: any){
    var variant = item.variantPrice? item.variantPrice : 0;
    var subVariant = item.subVariantPrice? item.subVariantPrice : 0;
    return variant + subVariant;
  }

  itemTotal(itemsPrice:any, item:any){
    return ((parseFloat(itemsPrice) + this.toppingsTotal(item) + this.variantTotal(item)) * item.quantity).toFixed(2);
  }

  handleAddressChange(searchAddress: any, isEnterKeyPress: boolean)
  {
    let pacContainers: any = Array.from(document.getElementsByClassName('pac-container'));
    let pacItems: any[] = [];
    let pacAddressList: any[] = [];
    let address: any = {};

    if(searchAddress.name || searchAddress.formatted_address) {
      address = searchAddress;
    }
    else {
      address['name'] = searchAddress.target.value
    }

    if(pacContainers.length) {
      pacItems = Array.from(pacContainers[pacContainers.length - 1].children);
    }

    pacItems.forEach((pacItem: any) => {
      pacAddressList.push(pacItem.innerText.trim().replace(/\s/g,  '').toLowerCase())
    });

    /* if(pacAddressList.some((pacAddress: any) => pacAddress == (address.name.trim().replace(/\s/g,  '').toLowerCase()))) {
      this.isAddressValid = true;
    } */
    if((pacItems.length == 0) && address.formatted_address
      && this.checkHouseNumber(address) && this.checkStreetName(address) && this.checkCity(address) && this.checkPostcode(address)) {
      this.isAddressValid = true;
      console.log('house no, street name, city and postcode');
    }
    else if((pacItems.length == 0) && address.formatted_address
      && this.checkHouseNumber(address) && this.checkStreetName(address) && this.checkCity(address)) {
      this.isAddressValid = true;
      console.log('house no, street name and city');
    }
    else if((pacItems.length == 0) && address.formatted_address
      && this.checkStreetName(address) && this.checkCity(address)) {
      this.isAddressValid = true;
      console.log('street name and city');
    }
    else if((pacItems.length == 0) && address.formatted_address
      && this.checkCity(address) && this.checkPostcode(address)) {
      this.isAddressValid = true;
      console.log('city and postcode');
    }
    else {
      this.isAddressValid = false;
    }

    // If Address is correct closes popup
    if(this.isAddressValid && isEnterKeyPress)
    {
      console.log(address);
      this.isGoogleAPIfetching = true;
      this.checkDistance(address.place_id, address.formatted_address, address);
    }

  }

  // Check for House No.
  checkHouseNumber(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('street_number')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for StreetName
  checkStreetName(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('route')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for City
  checkCity(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('locality')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for Postcode
  checkPostcode(address: any): boolean
  {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('postal_code')) {
        isValid = true;
      }
    });

    return isValid;
  }

  checkDistance(placeId: any, destination_add: any, address: any) {

    this.__passcodeService.checkPasscodes(this.siteDetails.passcode[0], placeId).subscribe(response => {
      this.isGoogleAPIfetching = false;
      const googleAPIResponse = response;
      console.log(googleAPIResponse);

      if(googleAPIResponse.data.rows[0].elements[0].status === 'NOT_FOUND' ||
        googleAPIResponse.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
        this.passCodeValidMsg = "Invalid Postcode";
      }
      else if (googleAPIResponse.data.rows[0].elements[0].status === 'OK') {
          const distanceInfo = googleAPIResponse.data.rows[0].elements[0].distance.text.split(' ');
          // If distance is in Meter, convert it into KM
          distanceInfo[0] = (distanceInfo[1] == 'm') ? (distanceInfo[0] / 1000) : distanceInfo[0];

          let distance = parseFloat(distanceInfo[0].toString().replace(/,/g, ''));

          if(distance > this.maxDeliveryDistance) {
            this.passCodeValidMsg = "Leider liefern wir nicht in Ihr Gebiet."; // Sorry, currently we're not delivering to your area.
          }
          else
          {
            this.currentDistance = distance;
            localStorage.setItem('currentDistance', this.currentDistance);

            this.selectedDelAddress = address.formatted_address;
            localStorage.setItem('deliveryType', 'DELIVERY');
            localStorage.setItem('postcode', destination_add);
            this.CartService.deliveryType = "DELIVERY";
            this.passcode = true;
            console.log(this.userDetails);

            this.updateDeliverySettings();

            localStorage.removeItem('houseNo');
            localStorage.removeItem('street');
            localStorage.removeItem('city');
            localStorage.removeItem('postal');

            address.address_components.forEach((address: any) => {
              if(address.types?.includes('street_number')) {
                localStorage.setItem('houseNo', address.long_name);
              }
              else if(address.types?.includes('route')) {
                localStorage.setItem('street', address.long_name);
              }
              else if(address.types?.includes('locality')) {
                localStorage.setItem('city', address.long_name);
              }
              else if(address.types?.includes('postal_code')) {
                localStorage.setItem('postal', address.long_name);
              }
            });

            if(this.elem.nativeElement.querySelector('#collection')) {
              this.elem.nativeElement.querySelector('#collection').classList.remove('delivery-selection-label-active');
              this.elem.nativeElement.querySelector('#delivery').classList.add('delivery-selection-label-active');
            }
            else {
              this.elem.nativeElement.querySelector('#collectionMob').classList.remove('delivery-selection-label-active');
              this.elem.nativeElement.querySelector('#deliveryMob').classList.add('delivery-selection-label-active');
            }

            this.deliveryPopup = false;
            this.renderer.removeClass(document.body, 'modal-open');

            /*
            this.elem.nativeElement.querySelector('#collection').checked = false;
            this.elem.nativeElement.querySelector('#delivery').checked = true;
            if (this.elem.nativeElement.querySelector('#collectionmob1')) {
              this.elem.nativeElement.querySelector('#collectionmob1').checked = false;
            }
            if (this.elem.nativeElement.querySelector('#deliverymob1')) {
              this.elem.nativeElement.querySelector('#deliverymob1').checked = true;
            }*/
          }
      }
    },
      (error: any) => {
        console.log(error);
      });
  }

  updateDeliverySettings()
  {
    this.currentDistance = localStorage.getItem('currentDistance') ? parseFloat(localStorage.getItem('currentDistance')) : 0
    for(let i = 0; i < this.siteDetails.distanceDetails.length; i++) {
      if(parseFloat(this.siteDetails.distanceDetails[i].minDistance) <= this.currentDistance
        && this.currentDistance < parseFloat(this.siteDetails.distanceDetails[i].maxDistance))
      {
        this.siteDetails.deliveryTime = this.siteDetails.distanceDetails[i].deliveryTime;
        this.CartService.orderTime = (this.CartService.deliveryType == 'DELIVERY') ?
            parseInt(this.siteDetails.distanceDetails[i].deliveryTime) : parseInt(this.siteDetails.collectionTime);

        this.siteDetails.minimumOrder = parseFloat(this.siteDetails.distanceDetails[i].minOrder);
        this.CartService.deliveryFee = parseFloat(this.siteDetails.distanceDetails[i].deliveryCharge);
        break;
      }
    }
    console.log(this.CartService.deliveryFee);
    this.CartService.cartTotal();
  }

  updateCartNote(event: any) {
    this.CartService.updateNote(event.target.value);
  }

  redirectToRegister() {
    this.loginStatus == true ? this.router.navigate(['register'], { state: { lastUrl: 'home' } }) : this.router.navigate(['payment-method']);
  }

  addTopings(value: any, index: number, el: any, deleteClick: boolean = false) {
    // console.log(this.selectedOption.toppings.indexOf(value));
    //Push Topping Name
    if(this.selectedItem && !this.selectedItem.toppings.includes(value)){
      this.selectedItem.toppings.push(value);
      //this.selectedOption.toppings.splice(this.selectedOption.toppings.indexOf(value), 1);
      //return;
    }

    console.log(this.selectedItem);
    console.log(this.toppingCount);
    //Set Topping Counts
    if(this.selectedItem && this.toppingCount[index] < 10 && !deleteClick)
    {
      ++this.toppingCount[index];

      this.selectedItem.toppings.forEach((item: { name: any; toppingCount: number; }) => {
        if(item.name === value.name) {
          item.toppingCount = this.toppingCount[index];
        }
      });
    }
    else if(this.selectedItem && this.toppingCount[index] > 0){
      --this.toppingCount[index];

      this.selectedItem.toppings.forEach((item: { name: any; toppingCount: number; }) => {
        if(item.name === value.name) {
          item.toppingCount = this.toppingCount[index];
        }
      });
    }

    if(this.toppingCount[index] > 0) {
      el.classList.add('topping-label');
    }

    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));
    //console.log(this.selectedOption.toppings);
    console.log(this.toppingCount);
  }

  addToCart()
  {
    this.CartService.updateCart(JSON.parse(localStorage.getItem('selectedItem')));
    this.selectedItem = null;

    this.CartService.updateItemCounter()
  }

  setOrderMode()
  {
    localStorage.setItem('deliveryType', 'PICKUP');
    this.CartService.deliveryFee = 0;
    localStorage.removeItem('postcode');
  }

  logOut()
  {
    console.log('Logout');
    if (localStorage.getItem('userDetails')) {
      localStorage.removeItem('userDetails');
      localStorage.setItem('isPaymentClicked', 'false');
      localStorage.setItem('deliveryType', 'PICKUP')
      localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;
      location.replace('/');
    } else {
      location.replace('/');
    }
  }

  showNote(index: number)
  {
    let item_note: any, item_note_input: any, cartItems = this.CartService.cartItems;

    if(this.isMobileView)
    {
      item_note = 'item-note-mob';
      item_note_input = 'item-note-input-mob';
    }
    else
    {
      item_note = 'item-note';
      item_note_input = 'item-note-input';
    }

    document.getElementsByName(item_note)[index].classList.add('hide-note-label');

    let noteInput: any = document.getElementsByName(item_note_input)[index];
    noteInput.classList.remove('hide-note-label');
    noteInput.classList.add('show-note-input');

    noteInput.focus();
    noteInput.defaultValue = cartItems[index].note;


  }

  addNote(event: any, index: number)
  {
    console.log(event.target.value);
    this.CartService.addNote(event.target.value, index)
  }

  showPlaceholders()
  {
    this.showHolder = "Suche \"" + this.searchPlaceholders[this.getRandomInt(this.searchPlaceholders.length)] + "\"";
    this.searchPlaceholderTimeout = setInterval(()=>{
      this.showHolder = "Suche \"" + this.searchPlaceholders[this.getRandomInt(this.searchPlaceholders.length)] + "\"";
    }, 3000)
  }

  stopPlaceholders()
  {
    clearInterval(this.searchPlaceholderTimeout);
    this.showHolder = "Suche";
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  //Search Menus
  searchMenus(event: any)
  {

    let searchedItem = event.target.value;
    let filteredCategories;
    let filteredItems;

    // Filter categories
    filteredCategories = this.originalCategories.filter((category: any) => {
      if(category.name.toLowerCase().includes(searchedItem.toLowerCase())
          || category.items.some((item: any) => item.name.toLowerCase().includes(searchedItem.toLowerCase()))) {
        return true;
      }
      else {
        return false;
      }

    });

    // Filter items
     for(let i = 0; i < filteredCategories.length; i++)
    {
      filteredItems = filteredCategories[i].items.filter((item: any) => {
        return item.name.toLowerCase().includes(searchedItem.toLowerCase());
      })

      filteredCategories[i] = JSON.parse(JSON.stringify(filteredCategories[i]));
      filteredCategories[i].items = Array.from(filteredItems);
    }



    if(searchedItem.length != 0) {
      this.categories = filteredCategories;
    }
    else {
      this.categories = Array.from(this.originalCategories);
    }

    this.CartService.categories = this.categories;
    this.CartService.updateItemCounter();

  }

  setProductInfo(i: number, j: number)
  {
    this.productInfo = this.categories[i].items[j];
    this.dialog.open(ProductInfoDialogComponent, {data: {item: this.productInfo}, autoFocus: false});

    console.log(this.productInfo);
  }

}
