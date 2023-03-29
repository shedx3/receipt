import { Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private apiHandler: ApiHandlerService) {}
  // Auth
  login(data: any) {
    return this.apiHandler.post('auth/login', data);
  }
  logout(data: any) {
    return this.apiHandler.post('auth/logout', data);
  }

  forgotPassword(data: any) {
    return this.apiHandler.post('auth/forgot-password', data);
  }

  // Registeration
  createInvoice(data: any) {
    return this.apiHandler.post('invoice/create', data);
  }
  fetchUsers(data: any) {
    return this.apiHandler.get('user', data);
  }

  getUsersById(id: number) {
    return this.apiHandler.get('user' + '/' + id);
  }

  updateUser(id: number, data: any) {
    return this.apiHandler.put('user' + '/' + id, data);
  }
  getUsersByIdEmail(id: number) {
    return this.apiHandler.get('user/email' + '/' + id);
  }
  deleteUsers(id: number) {
    return this.apiHandler.delete('user' + '/' + id);
  }
}
