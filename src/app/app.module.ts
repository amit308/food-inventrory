import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { ModuleModule } from './module/module.module';
import { RegisterFormComponent } from './register-form/register-form.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { UserLoginService } from './services/userlogin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { LogoutComponent } from './logout/logout.component';
import { ProductPopupComponent } from './product-popup/product-popup.component';
import { PasscodePopupComponent } from './passcode-popup/passcode-popup.component';
import { HomeComponent } from './home/home.component';
import { OrderProcessComponent } from './order-process/order-process.component';
import { ChoosePaymentMethodComponent } from './choose-payment-method/choose-payment-method.component';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { YourOrderComponent } from './your-order/your-order.component';
import { AddressConfirmComponent } from './address-confirm/address-confirm.component';
import { SwiperModule } from 'swiper/angular';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { NgxPayPalModule } from 'ngx-paypal';
import { GermanCurrencyPipe } from './german-currency.pipe';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ProductInfoDialogComponent } from './product-info-dialog/product-info-dialog.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegisterFormComponent,
    OrderSuccessComponent,
    OrderHistoryComponent,
    LogoutComponent,
    ProductPopupComponent,
    PasscodePopupComponent,
    HomeComponent,
    OrderProcessComponent,
    ChoosePaymentMethodComponent,
    YourOrderComponent,
    AddressConfirmComponent,
    GermanCurrencyPipe,
    ProductInfoDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ModuleModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    SwiperModule,
    NgxPayPalModule,
    GooglePlaceModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxMaterialTimepickerModule
  ],
  providers: [
    UserLoginService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '108557608347-718qt9se4q5gqe511pgqrm61f5rfse1r.apps.googleusercontent.com'
              //'527354408477-uei5fq4b410c73odn3tql0dh5jduo9j8.apps.googleusercontent.com'
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('2074735582676913')
          }
        ]
      } as SocialAuthServiceConfig,
    },
    JwtHelperService,
    {
      provide: JWT_OPTIONS, useValue: JWT_OPTIONS
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
