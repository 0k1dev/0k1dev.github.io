
const radius = 110;
const circumference = 2 * Math.PI * radius;

const data = {
  mining: 0.6,
  listing: 0.25,
  burning: 0.15
};

const mining = document.querySelector('.mining');
const listing = document.querySelector('.listing');
const burning = document.querySelector('.burning');
const percent = document.getElementById('percent');

[mining, listing, burning].forEach(c => {
  c.style.strokeDasharray = circumference;
});

setTimeout(() => {
  mining.style.strokeDashoffset = circumference * (1 - data.mining);
}, 300);

setTimeout(() => {
  listing.style.strokeDashoffset =
    circumference * (1 - (data.mining + data.listing));
}, 800);

setTimeout(() => {
  burning.style.strokeDashoffset =
    circumference * (1 - (data.mining + data.listing + data.burning));
}, 1300);

// Counter %
let p = 0;
const timer = setInterval(() => {
  percent.innerText = p + '%';
  p++;
  if (p > 100) clearInterval(timer);
}, 20);
