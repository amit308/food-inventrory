// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'https://foodinventorygerman.herokuapp.com/v1/',
  //apiBaseUrl: 'https://foodinventoryuk.herokuapp.com/v1/',
  //apiBaseUrl: 'http://localhost:3000/v1/',
  cover: 'restaurantService/getRestaurantImage?option=COVER',
  logo: 'restaurantService/getRestaurantImage?option=ICON',
  menuImage: 'menuService/downloadMenuImage',
  socketURL: 'https://foodinventorygerman.herokuapp.com',
  //socketURL: 'https://foodinventoryuk.herokuapp.com',
  //socketURL: 'http://localhost:3000',
  restaurant: "60f2c88e758f4b5e68762b81",
  restaurantPasscode: 'ct12dz',
  googleAPIkey: 'AIzaSyASsDyj3LdN-IfEZkeU-TmUV10hn3SboDc'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
