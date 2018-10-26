let level = 1;

const updateLevel = () => {
  if (score > 1000) {
    level += 1;
    interval -= 50;
  } else if (score > 2000) {
    level += 1;
    interval -= 100;
    
  } else if (score > 3000) {
    level++;
    interval -= 100;  
  } else if (score > 4000) {
    level++;
    interval -= 100;
  } else if (score > 5000) {
    level++;
    interval -= 100;
  } else if (score > 6000) {
    level++;
    interval -= 100;
  }
};

