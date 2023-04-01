import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthGuardService } from 'src/app/shared/auth-guard.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent {
  createInvoice: any = FormGroup;
  error: any = null;
  quantity: number = 0;
  price: number = 0;
  item_total: number = 0;
  spinner: boolean = false;
  errorMessage: any;
  discountShown: boolean = false;
  taxShown: boolean = false;
  base: any;
  data: any;
  constructor(
    private fb: FormBuilder,

    private authService: AuthGuardService
  ) {}

  ngOnInit(): void {
    this.createInvoice = this.fb.group({
      sendDate: new FormControl('', [Validators.required]),
      businessName: new FormControl('', Validators.required),
      dueDate: new FormControl('', Validators.required),
      sender: new FormControl('', Validators.required),
      senderEmail: new FormControl('', [Validators.required, Validators.email]),
      receiver: new FormControl('', Validators.required),
      receiverEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      discount: new FormControl(0),
      tax: new FormControl(0),
      items: this.fb.array([this.ItemGroup]),

      subTotal: new FormControl(0, Validators.required),
      grandTotal: new FormControl(0, Validators.required),
      note: new FormControl(''),
    });

    this.getTotal();
  }

  getTotal() {
    this.arrayData.controls.map((form) => {
      // console.log(form);

      const quantity = form.get('quantity');
      const price = form.get('price');
      const Total = form.get('Total');
      const discount = form.get('discount');
      const tax = form.get('tax');

      quantity?.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        const price = form.get('price');
        const newValue = value * price?.value; // example transformation
        Total?.setValue(newValue, { emitEvent: false });
        this.getSubTotal();

        // console.log(value);
      });

      price?.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        const quantity = form.get('quantity');
        const newValue = value * quantity?.value; // example transformation
        Total?.setValue(newValue, { emitEvent: false });
        this.getSubTotal();
        // console.log(value);
      });

      tax?.valueChanges.pipe(debounceTime(100)).subscribe((value) => {
        this.getSubTotal();
        console.log(value, 'changed');
      });

      discount?.valueChanges.pipe(debounceTime(100)).subscribe((value) => {
        this.getSubTotal();
        // console.log(value);
      });
    });
  }

  getSubTotal() {
    let stotal = 0;
    let grand_total = 0;
    let ds = this.createInvoice.value.discount;
    this.arrayData.controls.map((form) => {
      const Total = form.get('Total');
      const discount = form.get('discount');
      const tax = form.get('tax');
      stotal = stotal + Total?.value;
      grand_total =
        stotal +
        this.createInvoice.value.discount * 0.01 +
        this.createInvoice.value.tax * 0.01;
    });

    this.createInvoice.get('subTotal').patchValue(stotal);
    this.createInvoice.get('grandTotal').patchValue(grand_total);

    console.log('subtotal', stotal);
    console.log('grandtotal', grand_total);
  }

  get arrayData(): FormArray {
    return this.createInvoice.controls['items'] as FormArray;
  }

  ItemGroup: FormGroup = this.fb.group({
    itemName: new FormControl('', Validators.required),
    description: new FormControl(),
    quantity: new FormControl('', Validators.required),
    price: new FormControl('', Validators.required),
    Total: new FormControl('', Validators.required),
  });

  addItem() {
    const form = new FormGroup({
      itemName: new FormControl(''),
      description: new FormControl(),
      quantity: new FormControl(0),
      price: new FormControl(0),
      Total: new FormControl(0),
    });
    this.arrayData.push(form);
    this.getTotal();
  }
  removeItem(index: number) {
    this.arrayData.removeAt(index);
  }
  testSubmit() {
    console.log(this.createInvoice.value);
  }

  // fileSelect(event: any) {
  //   this.base = <File>event.target.files[0];
  //   console.log('selected', this.base);
  // }

  test() {}

  submit() {
    //  const addCurrentEvent = new FormData();
    //   console.log(this.base);
    // const items = this.createInvoice.get('items') as FormArray;
    // const itemsData:any = (items.controls as FormGroup[]).map((item) => ({
    //   itemName: item.get('itemName')?.value,
    //   description: item.get('description')?.value,
    //   quantity: item.get('quantity')?.value,
    //   price: item.get('price')?.value,
    //   Total: item.get('Total')?.value,
    // }));

    // if (this.base) {
    //   addCurrentEvent.append('image', this.base);
    //   addCurrentEvent.append('sendDate', this.createInvoice.value.sendDate);
    //   addCurrentEvent.append('dueDate', this.createInvoice.value.dueDate);
    //   addCurrentEvent.append('sender', this.createInvoice.value.sender);
    //   addCurrentEvent.append(
    //     'senderEmail',
    //     this.createInvoice.value.senderEmail
    //   );
    //   addCurrentEvent.append('receiver', this.createInvoice.value.receiver);
    //   addCurrentEvent.append('receiverEmail', this.createInvoice.value.receiverEmail);
    //   addCurrentEvent.append('discount', this.createInvoice.value.discount);
    //   addCurrentEvent.append('tax', this.createInvoice.value.tax);
    //   addCurrentEvent.append('subTotal', this.createInvoice.value.subTotal);
    //   addCurrentEvent.append('grandTotal', this.createInvoice.value.grandTotal);

    //   // addCurrentEvent.append('note', this.createInvoice.value.note);
    // addCurrentEvent.append('items', itemsData);
    // console.log(typeof itemsData);
    // const me = JSON.stringify(itemsData)
    // console.log('type2',typeof me);

    // // console.log(JSON.stringify(itemsData));

    // }
    this.authService.createInvoice(this.createInvoice.value).subscribe({
      next: (res) => {
        this.spinner = false;
        Swal.fire({
          title: 'Invoice created successfully!',
          timer: 2000,
          width: 400,
          icon: 'success',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
        console.log(res.responseData.invoice.invoiceId);
        this.data = res;
        console.log(this.data);

        const doc = new jsPDF();
        const invoiceData = this.createInvoice.value;

        // Set the title of the document
        doc.setFontSize(22);
        doc.text(`Invoice No: ${res.responseData.invoice.invoiceId}`, 70, 15);
        doc.text(`${invoiceData.businessName}`, 100, 25);
        // Add invoice data to the document
        doc.setFontSize(12);
        doc.text(`Sent on:${invoiceData.sendDate}`, 20, 30);
        doc.text(`Due date:${invoiceData.dueDate}`, 140, 30);
        doc.text(`Sender:${invoiceData.sender}`, 20, 40);
        doc.text(`Sender email: ${invoiceData.senderEmail}`, 20, 50);
        doc.text(`Receiver:${invoiceData.receiver}`, 140, 40);
        doc.text(`Receiver email:${invoiceData.receiverEmail}`, 140, 50);
        doc.text(`Discount: ${invoiceData.discount}%`, 20, 68);
        doc.text(`Tax: ${invoiceData.tax}%`, 20, 73);

        // Add invoice items to the document
        const items = invoiceData.items;

        const headings = ['Item', 'Description', 'Quantity', 'Price', 'Total'];

        // Set up table styling
        const tableProps = { margin: { top: 75 } };

        const tableData = items.map((item: any) => [
          item.itemName,
          item.description || '',
          item.quantity.toString(),
          item.price.toString(),
          item.Total.toString(),
        ]);

        // Add table to document
        let lastRowHeight = 0;
        autoTable(doc, {
          head: [headings],
          body: tableData,
          startY: tableProps.margin.top,
          margin: { left: 20 },
        });

        // Calculate and add subtotal and grand total to the document
        const subTotal = Number(invoiceData.subTotal).toFixed(2);
        const grandTotal = Number(invoiceData.grandTotal).toFixed(2);
        doc.text(`Subtotal: ${subTotal}`, 150, 68);
        doc.text(`Grand total: ${grandTotal}`, 150, 73);

        doc.save('invoice.pdf');

        // this.createInvoice.reset();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error creating invoice!',
          timer: 2000,
          width: 400,
          icon: 'error',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
        this.errorMessage = err.error.message;
        this.spinner = false;
      },
    });
  }
}
