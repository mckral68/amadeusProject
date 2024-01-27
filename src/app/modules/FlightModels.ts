export class Country {
  code!: string;
  city!: string;
  country!: string;
}
export class Flights {
  airline: string | undefined;
  arrival_airport: string | undefined;
  arrival_time: string | undefined;
  departure_time!: string;
  departure_airport: string | undefined;
  departure_date!: string;
  duration!: number;
  flight_number: number | undefined;
  price!: number;
}
