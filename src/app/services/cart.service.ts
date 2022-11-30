import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SiteMetaService } from './site-meta.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: any = [];
  cartTotalAmount: any;
  deliveryType: any = localStorage.getItem('deliveryType') ? localStorage.getItem('deliveryType') : 'PICKUP';
  userData: any = JSON.parse(localStorage.getItem('userDetails'));
  cartNote: any = localStorage.getItem('note');
  isToppingInCart: boolean = false;
  categories: any[]=[];
  deliveryFee: number = 0;
  discount: number;
  tip: any = 0;
  orderTime: any;

  constructor(private _SiteMetaService: SiteMetaService, private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    console.log("service", this.cartItems);
  }

  comparer(otherArray: any){
    return function(current:any){
      return otherArray.filter(function(other:any){
        return other._id == current._id
      }).length == 0;
    }
  }

 /*  compareToppings(item: any, cart: any)
  {
    console.log('comparing')
    for(let k = 0; k < cart.length; k++)
    {
      if (cart[k]._id === item._id && cart[k].option === item.option)
      {
        console.log('Item Found');
        console.log(cart[k].toppings.length);
        console.log(item.toppings.length);
        // @ts-ignore
        if (cart[k].toppings.length === item.toppings.length)
        {
          console.log('Toppings Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }
      }
    }
  } */
 
  compareToppings(item: any, cart: any)
  {
    console.log('comparing')
    for(let k = 0; k < cart.length; k++)
    {
      if (cart[k]._id === item._id && cart[k].option === item.option && cart[k].variant === item.variant && cart[k].subVariant === item.subVariant)
      {
        console.log('Item Found');
        console.log(cart[k].toppings.length);
        console.log(item.toppings.length);
        // @ts-ignore

        if (cart[k].variant === item.variant)
        {
          console.log('Variant Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }

        else if (cart[k].subVariant === item.subVariant)
        {
          console.log('subVariant Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }

        else (cart[k].toppings.length === item.toppings.length)
        {
          console.log('Toppings Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }
      }

      else if(cart[k]._id === item._id && cart[k].option === item.option && cart[k].variant === item.variant) 
      {       
        if (cart[k].variant === item.variant)
        {
          console.log('Variant Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }
        else (cart[k].toppings.length === item.toppings.length)
        {
          console.log('Toppings Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }
      } 

      else (cart[k]._id === item._id && cart[k].option === item.option)
      {
        if (cart[k].toppings.length === item.toppings.length)
        {
          console.log('Toppings Equal')
          for(let j = 0; j < item.toppings.length; j++)
          {
            for(let i = 0; i < cart[k].toppings.length; i++)
            {
              if (item.toppings[j].name === cart[k].toppings[i].name && item.toppings[j].toppingCount === cart[k].toppings[i].toppingCount)
              {
                console.log('found');
                this.isToppingInCart = true;
                break;
              }
              else
                this.isToppingInCart = false;
            }
          }
        }
      }
    }
  }

  updateItemCounter()
  {
    if(this.cartItems.length != 0) {
      for(let i = 0; i < this.categories.length; i++) {
        for(let j = 0; j < this.categories[i].items.length; j++)
        {
          let count = 0;
          this.cartItems.forEach((cartItem: any) => {
            if(this.categories[i].items[j]._id == cartItem._id)
            {
              count += cartItem.quantity
              this.categories[i].items[j].itemCount = count;
            }
          });
        }
      }
    }
  }

  updateCart(item: any) {
    var cart = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    if (cart.length == 0)
    {
      item.quantity = 1;
      cart[cart.length] = item;
    }
    else if(item.toppings.length === 0) //Item Without Toppings
    {
      console.log(item.option);
      console.log('without topping');
      var a = 0;
      var itemFound = false;

      while (a < cart.length)
      {
        console.log('loop');
        if (cart[a]._id === item._id && cart[a].option === item.option)
        {
          if (cart[a].toppings.length === 0 && cart[a].quantity > 0)
          {
            cart[a].quantity += 1;
            itemFound = true;
          }

        }
        ++a;
      }

      if(!itemFound)
      {
        item.quantity = 1;
        cart[cart.length] = item;
      }

      localStorage.setItem('cartItems', JSON.stringify(cart));
      this.cartItems = cart;
      this.cartTotal();
      return;
    }
    else  //Item With Toppings
    {
      var a = 0;
      var itemIs = 0;

      while (a < cart.length)
      {
        //var checkToppings = item.toppings.filter(this.comparer(cart[a].toppings));
        //console.log(checkToppings);
        if (cart[a]._id == item._id && cart[a].option == item.option && cart[a].toppings.length === item.toppings.length) {  

          console.log(item.toppings);
          this.compareToppings(item, cart);
          console.log(this.isToppingInCart);

          if(this.isToppingInCart) {
            cart[a].quantity += 1;
            this.isToppingInCart = false;
            itemIs = 1;
            break;
          }
          else {
            itemIs = 0;
            break;
          }
          /*
          localStorage.setItem('cartItems', JSON.stringify(cart));
          this.cartItems = cart;
          this.cartTotal();
          return;*/
        } else {
          itemIs = 0;
        }
        a++;
      }
      if (itemIs == 0) {
        console.log('if');
        item.quantity = 1;
        cart[cart.length] = item;
      }
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    this.cartItems = cart;
    console.log(this.cartItems);
    this.cartTotal();
  }

  getCart() {
    var cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    this.cartItems = cartItems;
    this.cartTotal();
    return;
  }

  removeItem(itemIndex: any) {
    var cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    cartItems[itemIndex].quantity=0;
    this.cartItems = cartItems;
    this.updateItemCounter();

    cartItems.splice(itemIndex, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.cartItems = cartItems;

    if(this.cartItems.length == 0) {
      this.tip = 0;
    }

    this.cartTotal();
  }

  updateQuantity(index: number, quantity: number) {
    var cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    cartItems[index].quantity = quantity;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.cartItems = cartItems;
    this.cartTotal();

    this.updateItemCounter();

    return;
  }

  addNote(note: any, index: number) {
    var cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    cartItems[index].note = note;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.cartItems = cartItems;
    this.cartTotal();
    return;
  }

  cartTotal() {
    let total = 0;
    let totalDis = 0;
    let totalDiscount = 0;
    var cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    this.discount = this.deliveryType == 'PICKUP' ? this._SiteMetaService.collectionDiscount : this._SiteMetaService.deliveryDiscount;

    cartItems.forEach((element: any) => {
      var toppingTotal = 0;
      var varPrice = 0;
      var subVarPrice = 0;
      if(element.variantPrice){
        varPrice = parseFloat(element.variantPrice);
      }

      if(element.subVariantPrice){
        subVarPrice = parseFloat(element.subVariantPrice);
      }

      if(element.toppings){
        element.toppings.forEach((topping: any) => toppingTotal += ((parseFloat(topping.price)) * parseFloat(topping.toppingCount)));
      }

      /* if(element.discount && element.discount!=0)
      {
        let itemPrice: any = element.price - (element.price * element.discount / 100);
        total += ((parseFloat(itemPrice) + toppingTotal) * element.quantity)
      }
      else {
        total += ((parseFloat(element.price) + toppingTotal) * element.quantity)
      } */

      if (element.excludeDiscount == false)
      {

        if (element.discount!=0)
        {
          let price = parseFloat(element.price) + varPrice + subVarPrice + toppingTotal;
          console.log(price);
          let itemDis = (price * element.quantity * element.discount) / 100
          console.log(itemDis);
          totalDiscount += itemDis;
          console.log(totalDiscount);
          let itemTotalPrice = price * element.quantity;
          total += (itemTotalPrice - itemDis);
          console.log(total);
        }
        else if (element.catDiscount != 0)
        {
          let price = parseFloat(element.price) + varPrice + subVarPrice + toppingTotal;
          let categoryDis = (price * element.quantity * element.catDiscount) / 100
          totalDiscount += categoryDis;
          let itemTotalPrice = price * element.quantity;
          total += (itemTotalPrice - categoryDis);
          console.log(total);

        }
        else
        {
          let price = parseFloat(element.price) + varPrice + subVarPrice + toppingTotal;
          totalDis = (price * element.quantity * this.discount / 100);
          totalDiscount += totalDis;
          let itemTotalPrice = price * element.quantity;
          total += (itemTotalPrice - totalDis);
          console.log(this.discount);
          console.log(total);
        }

      }
      else {
        let price = parseFloat(element.price) + varPrice + subVarPrice + toppingTotal;
        total += (price * element.quantity)
      }
    });


    this.cartTotalAmount = {
      subTotal: total.toFixed(2),
      delivery: this.deliveryFee.toFixed(2),
      discount: totalDiscount.toFixed(2),
      total: (total + this.deliveryFee + parseFloat(this.tip)).toFixed(2),
      /* total: ((total - (this.discount * total) / 100) + this.deliveryFee).toFixed(2), */
    }

    return this.cartTotalAmount;
  }

  proccessCart(paymentMethod: any, orderTime: any): Observable<any> {
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    const authToken = this.userData.token;
    var headers = new HttpHeaders({
      "Authorization": "Bearer " + authToken
    });
    var httpOptions = {
      headers: headers
    }

    const deliveryMode = localStorage.getItem('deliveryType')
    const deliveryAdd = this.userData.address ? this.userData.address.trim().replace(/\s\s+/g,  ' ') : '';
    var cartPayments = this.cartTotal();

    var orderDetails: {[k: string]: any} = {
      deliveryType: deliveryMode,
      itemDetails: this.cartItems,
      paymentMode: paymentMethod,
      orderTime: orderTime,
      tip: this.tip,
      subTotal: cartPayments.subTotal,
      discount: cartPayments.discount,
      totalAmount: cartPayments.total,
      deliveryCharge: this.deliveryFee, 
      note: localStorage.getItem('note'),
      address: deliveryAdd,
      contact: this.userData.contact,
      city: this.userData.city,
      postcode: this.userData.postcode,
      restaurantId: environment.restaurant
    }

    if(deliveryMode == 'DELIVERY') {
      orderDetails.deliveryAddress = deliveryAdd;
    }
     //console.log(orderDetails);

    return this.httpClient.post(environment.apiBaseUrl + 'orderService/addOrder', orderDetails, httpOptions);
  }

  updateNote(note: any) {
    localStorage.setItem('note', note);
  }
}
