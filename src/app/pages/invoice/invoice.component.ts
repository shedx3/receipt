import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/auth-guard.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent {
  signup: any = FormGroup;
  error: any = null;
  quantity: number = 0;
  rate: number = 0;
  item_total: number = 0;
  spinner: boolean = false;
  errorMessage: any;
  discountShown: boolean = false;
  taxShown: boolean = false;
base64:string | undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthGuardService
  ) {}

  ngOnInit(): void {
    this.signup = this.fb.group({
      date: new FormControl('', Validators.required),
      image: new FormControl('', Validators.required),
      due_date: new FormControl('', Validators.required),
      sender: new FormControl('', Validators.required),
      send_email: new FormControl('', [Validators.required, Validators.email]),
      receiver: new FormControl('', Validators.required),
      receiver_email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      discount: new FormControl(''),
      tax: new FormControl(''),
      item: this.fb.array([this.ItemGroup]),

      sub_total: new FormControl(0, Validators.required),
      grandTotal: new FormControl(0, Validators.required),
    });

    this.getTotal();
  }
fileSelect(event:any){
  const file :File = event.target.files[0]
  if(file){
    const reader = new FileReader();

    reader.onload=()=>{
      this.base64 = reader.result as string
    }
reader.readAsDataURL(file)
  }
  console.log(file);
  
}



  getTotal() {
    this.arrayData.controls.map((form) => {
      // console.log(form);

      const quantity = form.get('quantity');
      const rate = form.get('rate');
      const item_total = form.get('item_total');
      const discount = form.get('discount')
      const tax = form.get('tax')


      quantity?.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        const rate = form.get('rate');
        const newValue = value * rate?.value; // example transformation
        item_total?.setValue(newValue, { emitEvent: false });
        this.getSubTotal();

        // console.log(value);
      });

      rate?.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        const quantity = form.get('quantity');
        const newValue = value * quantity?.value; // example transformation
        item_total?.setValue(newValue, { emitEvent: false });
        this.getSubTotal();
        // console.log(value);
      });

      tax?.valueChanges.pipe(debounceTime(100)).subscribe((value) => {
        
        this.getSubTotal();
        console.log(value,"changed");
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
    let ds = this.signup.value.discount
    this.arrayData.controls.map((form) => {
      const item_total = form.get('item_total');
      const discount = form.get('discount')
      const tax = form.get('tax')
      stotal = stotal + item_total?.value;
      grand_total =
        stotal +
        (this.signup.value.discount * 0.01) +
        (this.signup.value.tax * 0.01);
        
      console.log(
        'discount',
        this.signup.value.discount,
        'tax',
        this.signup.value.tax,
        "red",ds
      );
      
      
    });
   
    
    this.signup.get('sub_total').patchValue(stotal);
    this.signup.get('grandTotal').patchValue(grand_total);
   
    
    console.log('subtotal', stotal);
    console.log('grandtotal', grand_total);
  }

  get arrayData(): FormArray {
    return this.signup.controls['item'] as FormArray;
  }

  ItemGroup: FormGroup = this.fb.group({
    item_name: new FormControl('', Validators.required),
    description: new FormControl(),
    quantity: new FormControl('', Validators.required),
    rate: new FormControl('', Validators.required),
    item_total: new FormControl('', Validators.required),
  });

  addItem() {
    const form = new FormGroup({
      item_name: new FormControl('', Validators.required),
      description: new FormControl(),
      quantity: new FormControl(0, Validators.required),
      rate: new FormControl(0, Validators.required),
      item_total: new FormControl(0, Validators.required),
    });
    this.arrayData.push(form);
    this.getTotal();
  }
  removeItem(index: number) {
    this.arrayData.removeAt(index);
  }
  testSubmit() {
    console.log(this.signup.value);
  }
  signupSubmit() {
    this.spinner = true;

    this.authService.registerUsers(this.signup.value).subscribe({
      next: (res) => {
        this.spinner = false;
        Swal.fire({
          title: 'Your Account has been created successfully!',
          timer: 2000,
          width: 400,
          icon: 'success',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        });
        this.signup.reset();
        setTimeout(() => {
          this.router.navigate(['login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.spinner = false;
        // console.log(err);
      },
    });
  }
}
