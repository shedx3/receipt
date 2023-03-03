
import { Component,OnInit} from '@angular/core';

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
  quantity: any = '';
  rate: any = '';
  spinner: boolean = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthGuardService
  ) {}

  ngOnInit(): void {
    this.signup = this.fb.group({
      date: new FormControl('2020-20-1', Validators.required),
      dueDate: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      item: this.fb.array([this.ItemGroup]),
    });
  }

  get arrayData(): FormArray {
    return this.signup.controls['item'] as FormArray;
  }

  ItemGroup() {
    return this.fb.group({
      item_name: new FormControl('', Validators.required),
      description: new FormControl(),
      quantity: new FormControl('', Validators.required),
      rate: new FormControl('', Validators.required),
    });
  }
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
  removeItem(index: any) {
    // this.itemArray.removeAt(index);
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
