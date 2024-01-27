import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import * as mockData from '../../seedData.json';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Country, Flights } from '../../modules/FlightModels';
import { MatInputModule } from '@angular/material/input';
import { Observable, map, startWith } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MyTimePipe } from '../../pipes/myTime.pipe';
import { compareSameCode, dateCheck } from '../../validator/validator';
import { ApiService, SearchParams } from '../../api/api.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    AsyncPipe,
    MatInputModule,
    NgxSpinnerModule,
    MyTimePipe,
    MatAutocompleteModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './search-bar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private spinner = inject(NgxSpinnerService);
  searchForm!: FormGroup;
  toCountries!: Observable<Country[]>;
  fromCountries!: Observable<Country[]>;
  flights!: Flights[];
  search: SearchParams;
  message: string = '';
  errMessage: Error[] = [];

  ngOnInit(): void {
    this.formInit();

    this.fromCountries = this.searchForm.controls['from'].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, false))
    );
    this.toCountries = this.searchForm.controls[
      'arrival_destination'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, true))
    );
    this.seedData();
  }
  submitForm() {
    this.message = '';
    if (this.searchForm.valid) {
      this.spinner.show();
      this.search = {
        return: this.searchForm.controls['one_way'].value
          ? ''
          : this.converDeartedData('return_time'),
        depart: this.converDeartedData('departure_date'),
        from: this.searchForm.controls['from'].value,
        to: this.searchForm.controls['arrival_destination'].value,
      };
      this.apiService
        .fetchData('https://api.turkishairlines.com/flights', this.search)
        .then((result) => {
          this.flights = result.data;
          this.message = result.message;
          this.spinner.hide();
        });
    } else {
      this.getFormValidationErrors();
      this.flights = [];
    }
  }
  formInit() {
    this.searchForm = this.fb.group({
      one_way: [false, [Validators.minLength(2)]],
      departure_date: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          dateCheck('departure_date', 'return_time'),
        ],
      ],
      from: ['', [Validators.required, Validators.minLength(2)]],
      arrival_destination: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          compareSameCode('from', 'arrival_destination'),
        ],
      ],
      return_time: [''],
    });
    this.searchForm.controls['one_way'].valueChanges.subscribe((v) => {
      if (!v) {
        this.searchForm.controls['return_time'].setValidators([
          Validators.required,
          Validators.minLength(2),
          dateCheck('departure_date', 'return_time'),
        ]);
      } else {
        this.searchForm.controls['return_time'].clearValidators();
      }
      this.searchForm.controls['return_time'].updateValueAndValidity();
    });
  }
  seedData() {
    this.toCountries.pipe(map((value) => (value = mockData.countries)));
    this.fromCountries.pipe(map((value) => (value = mockData.countries)));
  }
  private converDeartedData(control: string) {
    const departedDate = this.searchForm.controls[control].value;
    const lastDepartedDate = [
      departedDate.split('-')[2],
      departedDate.split('-')[1],
      departedDate.split('-')[0],
    ].join('.');
    return lastDepartedDate;
  }
  private getFormValidationErrors() {
    this.errMessage = [];
    Object.keys(this.searchForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.searchForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((kError) => {
          const errMessages: Error = {
            key: key,
            keyError: kError,
          };
          this.errMessage = [...this.errMessage, errMessages];
          console.log(
            'Key control: ' + key + ', keyError: ' + kError + ', err value: ',
            controlErrors[kError]
          );
        });
      }
    });
  }
  sortFlight(sortType?: string) {
    switch (sortType) {
      case 'price':
        this.flights.sort((a, b) => a.price - b.price);
        break;
      case 'date':
        this.flights.sort(
          (a, b) =>
            this.stringToDate(a.departure_date).getTime() -
            this.stringToDate(b.departure_date).getTime()
        );
        break;
      case 'duration':
        this.flights.sort((a, b) => a.duration - b.duration);
        break;
      case 'time':
        this.flights.sort((a, b) => {
          const [aHours, aMins] = a.departure_time.split(':');
          const [bHours, bMins] = b.departure_time.split(':');
          const aTotalMins = Number(aHours) * 60 + Number(aMins);
          const bTotalMins = Number(bHours) * 60 + Number(bMins);
          return aTotalMins - bTotalMins;
        });
    }
  }
  private _filter(value: string, type: boolean) {
    const filterValue = value.toLowerCase();
    if (!type) {
      return mockData.countries.filter(
        (c) =>
          c.city.toLowerCase().includes(filterValue) ||
          c.country.toLowerCase().includes(filterValue)
      );
    } else {
      return mockData.countries.filter(
        (c) =>
          c.city.toLowerCase().includes(filterValue) ||
          c.country.toLowerCase().includes(filterValue)
      );
    }
  }
  private stringToDate = (string: string) => {
    const formattedstring = string.split('.');
    return new Date(
      new Date(
        Number(formattedstring[2]),
        Number(formattedstring[1]) - 1,
        Number(formattedstring[0])
      )
    );
  };
}
export interface Error {
  key: string;
  keyError: string;
}
