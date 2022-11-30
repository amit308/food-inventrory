import {Component, OnDestroy, OnInit} from '@angular/core';
import { CartService } from '../services/cart.service';
import { SocketioService } from '../services/socket.service';
import { PushnoticeService } from '../services/pushnotice.service';
import { OrdersService } from '../services/orders.service';
import { SiteMetaService } from '../services/site-meta.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css']
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  cartItems: any;
  cartNote: any;
  cartSubtotal: any;
  order: any;
  orderStatus: any = 'AUSSTEHEND';
  orderType: any = localStorage.getItem('deliveryType') == 'PICKUP' ? 'Abholung' : 'Lieferung';
  orderTimeTitle: any = localStorage.getItem('deliveryType') == 'PICKUP' ? 'Abholezeit' : 'Lieferzeit';

  constructor(public CartService: CartService, private pushService: PushnoticeService,
    private socketService: SocketioService, private orderService: OrdersService, public __siteMeta: SiteMetaService) {

    this.socketService.joinOrderStatus(orderService.getOrderId());
    this.listenSockets();

    console.log('Order Success Constructor');

    if(localStorage.getItem('isOrderAdded') === 'true') {
      this.pushService.sendPushNotification(orderService.getOwnerId()).subscribe((response: any) => {
        //console.log(response);

      }, (error: any) => {
        console.log(error);
      });

      localStorage.removeItem('isOrderAdded');
    }

    //this.socketService.setupSocketConnection();
    //this.socketService.joinRoom();

   }

   ngOnDestroy(): void {
     console.log('destroy');
    this.socketService.leaveOrderStatus(this.orderService.getOrderId());
    this.socketService.removeAllListeners();
    //this.socketService.leaveRoom();
  }

  listenSockets() {
    this.socketService.on('refreshOrder')
    .subscribe(data =>{
      console.log('refreshOrder', data);
      this.order = data[0];
      this.orderStatus = (this.order && this.order.orderStatus === 'ACCEPTED') ? 'Akzeptiert' : 'Bestritten';
    })
  }

  ngOnInit(): void {

    this.cartItems = JSON.parse(localStorage.getItem('cartItems'));
    this.cartNote = localStorage.getItem('note');
    this.orderStatus = 'AUSSTEHEND';
    console.log(document.getElementById('pending'));
    localStorage.removeItem('cartItems');
    localStorage.removeItem('note');
  }

  toppingsTotal(item: any){
    var toppingTotal = 0;
    item.toppings.forEach((topping: any) => toppingTotal += (parseFloat(topping.price) * parseFloat(topping.toppingCount)));
    return toppingTotal;
  }

  itemTotal(itemsPrice:any, item:any){
    return ((parseFloat(itemsPrice) + this.toppingsTotal(item)) * item.quantity).toFixed(2);
  }

}
