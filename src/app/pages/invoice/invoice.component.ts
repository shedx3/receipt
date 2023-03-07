
import { Component,OnInit} from '@angular/core';
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
      item: this.fb.array([this.ItemGroup]),
      sub_total: new FormControl('', Validators.required),
      total: new FormControl('', Validators.required),

    });

    const quantity = this.ItemGroup.get('quantity');
    const rate = this.ItemGroup.get('rate');
    const item_total = this.ItemGroup.get('item_total');

    quantity?.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        const rate = this.ItemGroup.get('rate');
        const newValue = value * rate?.value  // example transformation
        item_total?.setValue(newValue, { emitEvent: false });
        console.log(value)
      });

      rate?.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        const quantity = this.ItemGroup.get('quantity');
        const newValue = value * quantity?.value // example transformation
        item_total?.setValue(newValue, { emitEvent: false });
        console.log(value)
      });

  }

  get arrayData(): FormArray {
    return this.signup.controls['item'] as FormArray;
  }

  ItemGroup: FormGroup = this.fb.group({
      item_name: new FormControl('', Validators.required),
      description: new FormControl(),
      quantity: new FormControl('', Validators.required),
      rate: new FormControl('', Validators.required),
      item_total: new FormControl('', Validators.required)
    });
  
  // get itemArray() {
  //   return <FormArray>this.signup.get('item');
  // }

  addItem() {
    const form = new FormGroup({
      item_name: new FormControl('', Validators.required),
      description: new FormControl(),
      quantity: new FormControl('', Validators.required),
      rate: new FormControl('', Validators.required),
    })
    this.arrayData.push(form);
    // this.itemArray.push(this.ItemGroup());
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

  // get quantity() {
  //   return this.ItemGroup().controls.quantity.value
  // }

  // get rate() {
  //   return this.ItemGroup().controls['rate'].value
  // }

  changeVal(e:any, field:any) {
    if (field === 'quantity') {
      this.quantity = e.target.value
    } else if (field === 'rate') {
      this.rate = e.target.value
    }
    this.item_total = this.quantity * this.rate
  }

}
