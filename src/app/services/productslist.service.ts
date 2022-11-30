import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsList {
  constructor(private httpClient: HttpClient) { }

  productsList(): Observable<any>{
    var headers = new HttpHeaders({
      "restaurant":  environment.restaurant
    });
    var httpOptions = {
      headers: headers
    }
    return this.httpClient.get(environment.apiBaseUrl + "/menuService/homeMenu/" + environment.restaurant, httpOptions);
  }
  
}
