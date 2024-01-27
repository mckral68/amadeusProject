import { Injectable } from '@angular/core';
import { Flights } from '../modules/FlightModels';
import * as mockData from '../seedData.json';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  async fetchData(url: string, options: SearchParams): Promise<FlightResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (url === 'https://api.turkishairlines.com/flights') {
          const [parsedData, text] = (await this.filterFlights(
            options,
            mockData.flights
          )) as [Flights[], string];
          const response: FlightResponse = {
            status: 200,
            data: parsedData,
            message: text,
          };
          resolve(response);
        } else {
          reject(new Error('Not Found'));
        }
      }, 1000);
    });
  }
  async filterFlights(options: SearchParams, data: Flights[]) {
    let message =
      'Sorry, we have no flights available. Please edit your search to find other routes';
    if (options.return.length > 3) {
      let data1 = data.filter(
        (f) =>
          f.arrival_airport.includes(options.from) &&
          f.departure_airport.includes(options.to) &&
          f.departure_date == options.return
      );
      if (data1.length > 0) {
        let data2 = data.filter(
          (f) =>
            f.arrival_airport.includes(options.to) &&
            f.departure_airport.includes(options.from) &&
            f.departure_date == options.depart
        );
        if (data2.length > 0) {
          message = 'Flights for the date you selected are listed';
          const latestData = [...data2, ...data1];
          return [latestData, message];
        } else {
          message = 'No flights found for the selected date.';
          return [[], message];
        }
      } else {
        message = 'No flights found for the selected date.';
        return [[], message];
      }
    }
    let filterFlights = data.filter(
      (f) =>
        f.departure_airport.includes(options.from) &&
        f.arrival_airport.includes(options.to) &&
        f.departure_date == options.depart
    );
    if (filterFlights.length > 0) {
      message = 'Flights for the date you selected are listed.';
    } else {
      filterFlights = data.filter(
        (flight) =>
          flight.departure_airport.includes(options.from) &&
          flight.arrival_airport.includes(options.to)
      );
      if (filterFlights.length > 0)
        message =
          'No flights found for the selected date, listing similar flights.';
    }
    return [filterFlights, message];
  }
}

export interface SearchParams {
  from: string;
  to: string;
  depart: string;
  return?: string;
}
interface FlightResponse {
  status: number;
  data: Flights[];
  message: string;
}
