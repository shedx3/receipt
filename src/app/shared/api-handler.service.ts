import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiHandlerService {
  private baseUrl = 'http://localhost:4000';
  // private token = localStorage.getItem('token');

  constructor(private httpclient: HttpClient) {}

  public header() {
    let headers = new HttpHeaders();
    // headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Accept', 'application/json');
    // headers = ['Accept'] = 'application/json';
    // headers = headers.set('Authorization', 'Bearer ' + this.token);
    return headers;
  }

  public get(path: string, base?: number): Observable<any> {
    path = `${this.baseUrl}/${path}`;
    return this.httpclient.get(path, { headers: this.header() });
  }

  public post(path: string, data: any, base?: number): Observable<any> {
    path = `${this.baseUrl}/${path}`;
    return this.httpclient.post(path, data || {}, {
      headers: this.header(),
    });
  }

  public put(path: string, data: any): Observable<any> {
    path = `${this.baseUrl}/${path}`;
    return this.httpclient.put(path, data || {});
  }

  public patch(path: string, data: any): Observable<any> {
    path = `${this.baseUrl}/${path}`;
    return this.httpclient.patch(path, data || {});
  }
  public delete(path: string): Observable<any> {
    path = `${this.baseUrl}/${path}`;
    return this.httpclient.delete(path);
  }
}
