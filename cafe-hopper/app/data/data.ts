// src/data/cafes.ts

export interface Review {
    userId: string;
    comment: string;
    ratings: {
        ambience?: number;
        service?: number;
        sound?: number;
        drinks?: number;
      };
  }
  
  export interface Cafe {
    id: string;
    name: string;
    address: string;
    area: string;
    industry: string;
    seating: {
      indoor?: number;
      outdoor?: number;
    };
    location: {
      latitude: number;
      longitude: number;
    };
    tags?: string[];
    image?: string;
    hours: string;
    reviews: Review[];
    friendsHere: string[];
    publicUsers: number;
    images?: string[];
  }
  
  export const cafes: Cafe[] = [
    {
      id: "1",
      name: "Transport Hotel",
      address: "Tenancy 29, Ground , 2 Swanston Street MELBOURNE 3000",
      area: "Melbourne (CBD)",
      industry: "Pubs, Taverns and Bars",
      seating: {
        indoor: 230,
        outdoor: 120,
      },
      location: {
        latitude: -37.817777826050005,
        longitude: 144.96994164279243,
      },
      tags: ["Pub", "Bar", "CBD"],
      image: "https://source.unsplash.com/800x600/?bar",
      hours: "10am – 11pm",
      reviews: [
        {
          userId: "u5", // Erin
          comment: "Fun place with great food.",
          ratings: { ambience: 4, service: 5, sound: 3, drinks: 4 },
        },
        {
          userId: "u2", // Lena
          comment: "Perfect coffee on the go.",
          ratings: { ambience: 5, service: 4, sound: 5, drinks: 5 },
        },
        {
          userId: "u4", // Dana
          comment: "Best bagels in the CBD!",
          ratings: { ambience: 4, service: 4, sound: 3, drinks: 4 },
        },
      ],
      friendsHere: ["Max"],
      publicUsers: 3,
      images: [
        "https://source.unsplash.com/800x600/?bar",
        "https://source.unsplash.com/800x600/?pub",
      ]
    },
    {
      id: "2",
      name: "Altius Coffee Brewers",
      address: "Shop , Ground , 517 Flinders Lane MELBOURNE 3000",
      area: "Melbourne (CBD)",
      industry: "Takeaway Food Services",
      seating: {
        outdoor: 4,
      },
      location: {
        latitude: -37.819875445799994,
        longitude: 144.95648638781466,
      },
      tags: ["Coffee", "Takeaway", "Outdoor"],
      image: "https://source.unsplash.com/800x600/?coffee",
      hours: "6:30am – 5pm",
      reviews: [
        {
          userId: "u5", // Erin
          comment: "Fun place with great food.",
          ratings: { ambience: 4, service: 5, sound: 3, drinks: 4 },
        },
        {
          userId: "u2", // Lena
          comment: "Perfect coffee on the go.",
          ratings: { ambience: 5, service: 4, sound: 5, drinks: 5 },
        },
        {
          userId: "u4", // Dana
          comment: "Best bagels in the CBD!",
          ratings: { ambience: 4, service: 4, sound: 3, drinks: 4 },
        },
      ],
      friendsHere: [],
      publicUsers: 2,
      images: [
        "https://source.unsplash.com/800x600/?coffee",
        "https://source.unsplash.com/800x600/?cafe"
      ]
    },
    {
      id: "3",
      name: "Five & Dime Bagel",
      address: "16 Flinders Lane MELBOURNE 3000",
      area: "Melbourne (CBD)",
      industry: "Bakery Product Manufacturing",
      seating: {
        indoor: 14,
      },
      location: {
        latitude: -37.819875445799994,
        longitude: 144.95648638781466,
      },
      tags: ["Bagels", "Bakery", "Indoor"],
      image: "https://source.unsplash.com/800x600/?bakery",
      hours: "7am – 3pm",
      reviews: [
        {
          userId: "u5", // Erin
          comment: "Fun place with great food.",
          ratings: { ambience: 4, service: 5, sound: 3, drinks: 4 },
        },
        {
          userId: "u2", // Lena
          comment: "Perfect coffee on the go.",
          ratings: { ambience: 5, service: 4, sound: 5, drinks: 5 },
        },
        {
          userId: "u4", // Dana
          comment: "Best bagels in the CBD!",
          ratings: { ambience: 4, service: 4, sound: 3, drinks: 4 },
        },
      ],
      friendsHere: [],
      publicUsers: 1,
      images: [
        "https://source.unsplash.com/800x600/?bagel",
        "https://source.unsplash.com/800x600/?breakfast",
      ]
    }
  ];
  