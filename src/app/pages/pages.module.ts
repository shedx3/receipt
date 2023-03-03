import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { PagesRoutingModule } from './pages-routing.module';
import { InvoiceComponent } from './invoice/invoice.component';


@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    ReactiveFormsModule,FormsModule
  ]
})
export class PagesModule { }
