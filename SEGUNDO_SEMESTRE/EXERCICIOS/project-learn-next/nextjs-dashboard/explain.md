/app - contains all the routes, components, and logic for you application, this is where you'll be mostly working from

/app/lib - contains functions used in your  application, such as reusable utility functions and data fetching functions

/app/ui - Contains all the UI components for you application, such as cards, tables, and forms. To save time, we've pre-styled these components for you

/public - Contains all the static assets for your application, such as images

config Files - You'll also notice config files such as next.config.ts at the root of your application. Most of these files are created and pre--configured when you  start a new project using create-next-app. You will not need to modify them in this course

take a look t the /app/lib/definitions.ts - Here, we manually define the types that will be return from the database:
    export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
 property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

