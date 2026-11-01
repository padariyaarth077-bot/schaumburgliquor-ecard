export const business = {
  name: 'Schaumburg Liquors',
  tagline: 'Your neighborhood stop for every occasion.',
  phone: '+18476103936',
  phoneDisplay: '(847) 610-3936',
  address: '801 E Schaumburg Rd, Schaumburg, IL 60194',
  addressParts: {streetAddress:'801 E Schaumburg Rd',addressLocality:'Schaumburg',addressRegion:'IL',postalCode:'60194',addressCountry:'US'},
  logo: '/assets/logo.webp',
  instagramUrl: 'https://www.instagram.com/schaumburg_liqours?srtk=OGw0OGphcHhkYzVr',
  facebookUrl: 'https://www.facebook.com/share/19fwP6eJXB/?mibextid=wwXIfr',
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=801%20E%20Schaumburg%20Rd%2C%20Schaumburg%2C%20IL%2060194',
  googleReviewUrl: '',
  websiteUrl: '',
  email: '',
  timezone: 'America/Chicago',
  // Minutes after midnight; closing times above 1440 run into the next day.
  hours: [[660,1200],[630,1320],[630,1320],[630,1320],[630,1320],[630,1440],[630,1440]],
  specialHours: {},
  hoursRows: [['Monday – Thursday', '10:30 AM – 10:00 PM'], ['Friday – Saturday', '10:30 AM – 12:00 AM'], ['Sunday', '11:00 AM – 8:00 PM']],
  categories: ['Spirits', 'Wine', 'Beer', 'Ready to drink'],
  highlights: ['Apple Pay & contactless', 'Credit cards accepted', 'Wheelchair accessible', 'Parking available'],
  gallery: [
    [7, 'Schaumburg Liquors storefront illuminated at night'],
    [1, 'Inside Schaumburg Liquors, with spirits displays and wine shelves'],
    [3, 'Wine selection on the shelves at Schaumburg Liquors'],
    [4, 'Beer and beverage coolers inside the store'],
    [5, 'Spirits display with Rampur bottles and gift boxes'],
    [6, 'Spirits and liqueurs arranged along the store shelves'],
    [8, 'Decorative tequila bottles on a store display'],
    [9, 'Spirits bottles displayed near the store counter'],
    [10, 'Ready-to-drink beverages on the store shelves'],
    [11, 'The store’s refrigerated beer selection'],
    [2, 'Liqueurs and specialty spirits on store shelves'],
  ],
};

export const reviewTags = ['Helpful Staff','Great Selection','Friendly Service','Clean Store','Convenient Location','Easy Shopping','Local Favorites','Product Variety','Good Experience','Something Else'];

export function storeStatus(date = new Date(), config = business) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:config.timezone,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday);
  const key = `${parts.year}-${parts.month}-${parts.day}`;
  const schedule = Object.hasOwn(config.specialHours,key) ? config.specialHours[key] : config.hours[day];
  const minute = +parts.hour*60 + +parts.minute;
  const yesterday = new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day-1)).toISOString().slice(0,10);
  const previous = Object.hasOwn(config.specialHours,yesterday) ? config.specialHours[yesterday] : config.hours[(day+6)%7];
  return Boolean((schedule && minute>=schedule[0] && minute<schedule[1]) || (previous && previous[1]>1440 && minute<previous[1]-1440));
}
