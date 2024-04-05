const data = {
  name: "Deluxe Rooom",
  data: {
    2024: {
      1: {
        1: {
          price: 1200,
          availability: true,
          inventory: 1200,
        },
        2: {
          price: 1200,
          availability: true,
          inventory: 1200,
        },
        3: {
          price: 1200,
          availability: true,
          inventory: 1200,
        },
      },
    },
  },
};
for (let i = 4; i < 10; i++) {
  data.data[2024][1][i] = {
    price: 1200,
    availability: true,
    inventory: 9999,
  };
}
// console.log(data.data[2024][1]);
console.log(new Date());

let arr = [];

arr[2] = 99;

console.log(arr);
