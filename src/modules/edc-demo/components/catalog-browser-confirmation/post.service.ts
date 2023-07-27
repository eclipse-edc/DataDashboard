import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class YourService {
  private apiUrl = 'http://broker.demo.truzztport.com/federatedcatalog';
  private apiKey = 'ApiKeyDefaultValue';

  constructor(private http: HttpClient) { }

  makeApiCall() {
    const headers = new HttpHeaders()
      .set('Authorization', this.apiKey)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const requestData = { "criteria": [] };

    return this.http.post(this.apiUrl, requestData, { headers });
  }
}
