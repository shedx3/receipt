import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

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
  base64: any;

  constructor(
    private fb: FormBuilder,

    private authService: AuthGuardService
  ) {}

  ngOnInit(): void {
    this.createInvoice = this.fb.group({
      sendDate: new FormControl('', [Validators.required]),
      image: new FormControl('', Validators.required),
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

  fileSelect($event: any) {
    const target = $event.target;
    const file: any = $event.target.files[0];

    if (file) {
      let reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]);

      reader.onload = (e) => {
        this.base64 = reader.result as string;
        console.log(this.base64);
      };
    }
  }

  submit() {
    console.log(this.base64);

    this.createInvoice.patchValue({ image: this.base64 });
    this.authService.createInvoice(this.createInvoice.value).subscribe({
      next: (res) => {
        console.log(this.createInvoice.value);
        console.log(res);

        this.spinner = false;
        Swal.fire({
          title: 'Invoice created successfully!',
          timer: 2000,
          width: 400,
          icon: 'success',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
        console.log(res);

        this.createInvoice.reset();
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
        // console.log(err);
      },
    });
  }
}
